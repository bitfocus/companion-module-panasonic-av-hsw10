import { createServer, type Server, type Socket } from 'node:net'

// Written out here rather than taken from the module under test
const STX = '\x02'
const ETX = '\x03'

/** A message as the switcher sends it */
export function switcherMessage(...fields: string[]): string {
	return `${STX}${fields.join(':')}${ETX}`
}

export interface ReceivedMessage {
	/** performance.now() on arrival */
	at: number
	/** Which connection it came on, counting from 1 */
	connection: number
	/** The fields between STX and ETX, command first */
	fields: string[]
}

/**
 * An AV-HSW10 on a loopback TCP port, for the module to connect to. It answers a bus status query with the bus's
 * source, and a bus setting with the new source. These replies are synthetic, not captured from a switcher: they follow
 * the message forms the module was written against.
 */
export class FakeSwitcher {
	readonly received: ReceivedMessage[] = []
	/** The source on each bus. A bus not set here reports input 1 */
	readonly busSources = new Map<string, string>()
	port = 0
	/** Connections accepted so far */
	connections = 0
	/** Off, the socket stays open but nothing is answered, as when the switcher dies or a cable is pulled mid-path */
	answering = true
	readonly #server: Server
	readonly #sockets = new Set<Socket>()
	readonly #buffers = new Map<Socket, string>()

	constructor() {
		this.#server = createServer((socket) => {
			this.connections++
			const connection = this.connections
			this.#sockets.add(socket)
			this.#buffers.set(socket, '')
			socket.on('data', (chunk: Buffer) => this.#onData(socket, connection, chunk))
			socket.on('close', () => {
				this.#sockets.delete(socket)
				this.#buffers.delete(socket)
			})
			socket.on('error', () => {})
		})
	}

	async listen(): Promise<void> {
		await new Promise<void>((resolve) => this.#server.listen(0, '127.0.0.1', resolve))
		const address = this.#server.address()
		if (!address || typeof address === 'string') throw new Error('fake switcher did not get a port')
		this.port = address.port
	}

	async close(): Promise<void> {
		this.dropConnections()
		await new Promise<void>((resolve) => this.#server.close(() => resolve()))
	}

	get openConnections(): number {
		return this.#sockets.size
	}

	/** Closes every connection from the switcher's end */
	dropConnections(): void {
		for (const socket of this.#sockets) socket.destroy()
	}

	/** Writes to every connection */
	broadcast(data: string): void {
		for (const socket of this.#sockets) socket.write(data, 'latin1')
	}

	/** The commands received, in order, optionally only those on one connection */
	commands(connection?: number): string[] {
		return this.received.filter((m) => connection === undefined || m.connection === connection).map((m) => m.fields[0])
	}

	/** The fields of every message received with a command */
	messages(command: string): string[][] {
		return this.received.filter((m) => m.fields[0] === command).map((m) => m.fields)
	}

	#onData(socket: Socket, connection: number, chunk: Buffer): void {
		let buffer = (this.#buffers.get(socket) ?? '') + chunk.toString('latin1')
		let end: number
		while ((end = buffer.indexOf(ETX)) !== -1) {
			const start = buffer.lastIndexOf(STX, end)
			if (start !== -1) {
				const fields = buffer.slice(start + 1, end).split(':')
				this.received.push({ at: performance.now(), connection, fields })
				this.#answer(socket, fields)
			}
			buffer = buffer.slice(end + 1)
		}
		this.#buffers.set(socket, buffer)
	}

	#answer(socket: Socket, [command, ...args]: string[]): void {
		if (!this.answering || socket.destroyed) return
		switch (command) {
			case 'QBSC': {
				const [bus] = args
				socket.write(switcherMessage('ABSC', bus, this.busSources.get(bus) ?? '01'), 'latin1')
				break
			}
			case 'SBUS': {
				const [bus, source] = args
				this.busSources.set(bus, source)
				socket.write(switcherMessage('ABUS', bus, source), 'latin1')
				break
			}
		}
	}
}

/** A port nothing is listening on */
export async function closedPort(): Promise<number> {
	const switcher = new FakeSwitcher()
	await switcher.listen()
	const { port } = switcher
	await switcher.close()
	return port
}
