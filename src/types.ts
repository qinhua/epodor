export enum ComponentType {
  // 无源元件 (Passive)
  RESISTOR = 'Resistor',
  CAPACITOR = 'Capacitor',
  INDUCTOR = 'Inductor',
  POTENTIOMETER = 'Potentiometer',
  TRANSFORMER = 'Transformer',
  FUSE = 'Fuse',
  CRYSTAL = 'Crystal Oscillator',
  VARISTOR = 'Varistor', // 压敏电阻
  THERMISTOR = 'Thermistor', // 热敏电阻

  // 有源元件 (Active)
  DIODE = 'Diode',
  ZENER_DIODE = 'Zener Diode', // 稳压二极管
  LED = 'LED',
  TRANSISTOR = 'Transistor', // BJT
  MOSFET = 'MOSFET', // 场效应管
  IC = 'Integrated Circuit',
  OPTOCOUPLER = 'Optocoupler', // 光耦
  THYRISTOR = 'Thyristor', // 可控硅

  // 机电与传感器 (Electromechanical)
  RELAY = 'Relay',
  SPEAKER = 'Speaker', // 扬声器/蜂鸣器
  SWITCH = 'Switch', // 开关
}

export enum ComponentCategory {
  PASSIVE = '无源元件',
  ACTIVE = '有源元件',
  ELECTROMECHANICAL = '机电/传感器',
}

export interface ComponentData {
  id: string;
  name: string;
  type: ComponentType;
  category: ComponentCategory; // 新增分类
  description: string;
  symbol: string;
  workingPrinciple: string;
  applications: string[];
  multimeterGuide: {
    steps: string[];
    expectedReading: string;
  };
  specs: {
    label: string;
    value: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
