# Panasonic AV HSW 10 Switcher

Requires Companion 5.1 or later.

## Config

The AV HSW 10 uses a combination of TCP and UDP messages.

A TCP Socket is opened from Companion to the switcher which is used to issue commands to the switcher. If the connection sits idle, the module queries the PGM bus every 10 seconds to keep it open. A switcher that has replied, and then sends nothing for 25 seconds, is taken to have gone, and the module reconnects.

The switcher should be configured to return Bus Status (`ABSC`) notifications via UDP to its configured destination port number. The module binds to this port on 0.0.0.0, and takes notifications only from the switcher's address. A hostname is resolved to find it.

## Actions

- Auto Transition
- Bus Source
- Bus Transition
- Cut Transition
- Key Signal Coupling
- Picture in Picture
- Source Name
- Source Name Display
- Transition Pattern

The bus and source of Bus Source are chosen from a list, or with an expression. An expression must return the switcher's code for one, such as `1` for PGM or `113` for AUX 1. Anything else and the action is not run.

## Feedbacks

- Bus Source
- Bus Source (Value)

Bus Source (Value) gives the source on a bus as `{ crosspoint, name }`, such as `{ "crosspoint": "05", "name": "INPUT 5" }`, where `crosspoint` is the switcher's code for the source and `name` is as the source lists show it. It is `null` until the switcher reports the bus.
