export const STX = '\x02'
export const ETX = '\x03'
export const SEP = '\x3a' // ':'

export enum MsgSyntax {
	Stx = STX,
	Etx = ETX,
	Sep = SEP,
}

export enum Messages {
	BusSettingControl = 'SBUS',
	BusSettingResponse = 'ABUS',
	BusStatusQuery = 'QBSC',
	BusStatusResponse = 'ABSC',
	BusCrosspointQuery = 'QBST',
	BusCrosspointResponse = 'ABST',
	SourceNameDisplay = 'SPST',
	SourceNameSet = 'SSNM',
	SourceNameResponse = 'ASNM',
	SourceNameQuery = 'QSNM',
	KeySignalCouplingSet = 'SKRS',
	KeySignalCouplingResponse = 'AKRS',
	KeySignalCouplingQuery = 'QKRS',
	AutoTransitionSet = 'SAUT',
	CutTransitionSet = 'SCUT',
	AutoTransitionTimeQuery = 'QTIM',
	AutoTransitionTimeResponse = 'ATIM',
	AutoTransitionTimeSet = 'STIM',
	BusTransitionStatusQuery = 'QBTI',
	BusTransitionStatusResponse = 'ABTI',
	BusTransitionStatusSet = 'SBTI',
	TransitionPatternQuery = 'QPAT',
	TransitionPatternResponse = 'APAT',
	TransitionPatternControl = 'SPAT',
	PinPStatusQuery = 'QPNP',
	PinPStatusResponse = 'APNP',
	PinPSet = 'SPNP',
	Error = 'EROR',
}

export enum CrosspointControlBusSelection {
	PGM = '01',
	PVW = '02',
	KEY1_F = '03',
	KEY1_S = '04',
	KEY2_F = '05',
	KEY2_S = '06',
	AUX1 = '113',
	AUX2 = '114',
	MV_1 = '153',
	MV_2 = '154',
	MV_3 = '155',
	MV_4 = '156',
	MV_5 = '157',
	MV_6 = '158',
	MV_7 = '159',
	MV_8 = '160',
	MV_9 = '161',
	MV_10 = '162',
	MV_11 = '163',
	MV_12 = '164',
	MV_13 = '165',
	MV_14 = '166',
	MV_15 = '167',
	MV_16 = '168',
}

export enum CrosspointControlSourceSelection {
	IN1 = '01',
	IN2 = '02',
	IN3 = '03',
	IN4 = '04',
	IN5 = '05',
	IN6 = '06',
	IN7 = '07',
	IN8 = '08',
	IN9 = '09',
	AnalogIN = '10',
	CBGD1 = '145',
	CBGD2 = '146',
	CBAR = '147',
	BLACK = '148',
	STILL1_V = '149',
	STILL1_K = '150',
	STILL2_V = '151',
	STILL2_K = '152',
	MV = '165',
	KeyOUT = '171',
	CLN = '172',
	PGM = '201',
	PVW = '203',
	AUX1 = '227',
	AUX2 = '228',
	IPOUT1 = '231',
	IPOUT2 = '232',
	CLOCK = '251',
}

export enum BusCrosspointQueryBusSelection {
	BusA = '00',
	BusB = '01',
	PGM = '02',
	PVW = '03',
	KEY1_F = '04',
	KEY1_S = '05',
	KEY2_F = '06',
	KEY2_S = '07',
	AUX1 = '14',
	AUX2 = '15',
}

export enum BusCrosspointResponseCrossPoint {
	XPT1 = '00',
	XPT2 = '01',
	XPT3 = '02',
	XPT4 = '03',
	XPT5 = '04',
	XPT6 = '05',
	XPT7 = '06',
	XPT8 = '07',
	XPT9 = '08',
	XPT10 = '09',
	XPT11 = '10',
	XPT12 = '11',
	NoSelection = '99',
}

export enum BusCrosspointResponseTallyInfo {
	OFF = '0',
	ON = '1',
}

export enum SourceNameClassicifcation {
	DEFAULT = '00',
	USER = '01',
}

export enum SourceNameObject {
	IN1 = '01',
	IN2 = '02',
	IN3 = '03',
	IN4 = '04',
	IN5 = '05',
	IN6 = '06',
	IN7 = '07',
	IN8 = '08',
	IN9 = '09',
	AUX1 = '227',
	AUX2 = '228',
}

export enum KeySignalCouplingStatus {
	FillToSource = '00',
	SourceToFill = '01',
}

export enum SettingForAuxTransitionSource {
	BKGD = '00',
	KEY1 = '01',
	KEY2 = '04',
	FTB = '06',
}

export enum SettingForAuxTransitionEffect {
	MIX = '00',
	WIPE = '01',
}

export enum SettingForAuxTransitionOperationSetting {
	TiggerOn = '0',
	OnTake = '1',
	OffTake = '2',
}

export enum BusType {
	AUX1 = '01',
	AUX2 = '02',
}

export enum BusTransitionResponseEnable {
	Enable = '01',
	Disable = '02',
}

export enum TransitionPatternQueryType {
	BKGD = '01',
	KEY1 = '02',
}

export enum TransitionPatternResponsePattern {
	WIPE01 = '01',
	WIPE02 = '02',
	WIPE03 = '03',
	WIPE04 = '04',
	WIPE05 = '05',
	WIPE06 = '06',
	WIPE07 = '07',
	WIPE08 = '08',
	WIPE09 = '09',
	WIPE10 = '10',
	WIPE11 = '11',
	WIPE12 = '12',
	WIPE13 = '13',
	WIPE14 = '14',
	WIPE15 = '15',
	WIPE16 = '16',
}

export enum PinPStatusQueryTarget {
	PinPKEY1 = '1',
	PinPKEY2 = '2',
}

export enum PinPBorderWidth {
	None = '0',
	Small = '1',
	Medium = '2',
	Large = '3',
	NoneOfTheAbove = '4',
}

export enum PinPBorderColor {
	White = '0',
	Gray1 = '1',
	Gray2 = '2',
	Black = '3',
	NoneOfTheAbove = '4',
}

export enum ErrorDetails {
	OutOfRangeParameter = '01',
	SyntaxError = '02',
}
