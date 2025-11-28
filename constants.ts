import { ComponentData, ComponentType, ComponentCategory } from './types';

export const COMPONENTS: ComponentData[] = [
  // --- 无源元件 ---
  {
    id: 'res-001',
    name: '碳膜电阻',
    type: ComponentType.RESISTOR,
    category: ComponentCategory.PASSIVE,
    description: '电子电路中最基础的元件，用于限制电流大小或分压。',
    symbol: 'R',
    workingPrinciple: '利用碳膜对电子流动的阻碍作用，将电能转化为热能，遵循欧姆定律 V=IR。',
    applications: ['限流保护', '分压电路', '上拉/下拉', '阻抗匹配'],
    multimeterGuide: {
      steps: ['拨至电阻档 (Ω)', '确保电路断电', '表笔接触两端'],
      expectedReading: '读数接近色环标示值。若为 OL 则开路。'
    },
    specs: [{ label: '单位', value: 'Ω' }, { label: '误差', value: '±5%' }]
  },
  {
    id: 'cap-001',
    name: '电解电容',
    type: ComponentType.CAPACITOR,
    category: ComponentCategory.PASSIVE,
    description: '有极性的大容量储能元件，主要用于电源滤波。',
    symbol: 'C',
    workingPrinciple: '电荷在电场作用下聚集在极板上。电解液氧化膜作为介质，提供极大电容量。',
    applications: ['电源滤波', '隔直通交', '储能', '旁路'],
    multimeterGuide: {
      steps: ['先短接放电', '拨至电容档', '红接正黑接负'],
      expectedReading: '读数接近标称值。电阻档测应先小后大。'
    },
    specs: [{ label: '单位', value: 'F' }, { label: '极性', value: '有' }]
  },
  {
    id: 'ind-001',
    name: '电感线圈',
    type: ComponentType.INDUCTOR,
    category: ComponentCategory.PASSIVE,
    description: '通直流阻交流，将电能转化为磁能存储。',
    symbol: 'L',
    workingPrinciple: '电流流过线圈产生磁场，电流变化产生感应电动势阻碍变化（楞次定律）。',
    applications: ['滤波', '振荡', '升压电路', '扼流'],
    multimeterGuide: {
      steps: ['拨至电阻档', '测量两端阻值'],
      expectedReading: '很小的电阻值（几欧姆）。若 OL 则断路。'
    },
    specs: [{ label: '单位', value: 'H' }, { label: '直流电阻', value: '低' }]
  },
  {
    id: 'pot-001',
    name: '电位器',
    type: ComponentType.POTENTIOMETER,
    category: ComponentCategory.PASSIVE,
    description: '可调节阻值的电阻器，用于音量或参数调节。',
    symbol: 'RP/VR',
    workingPrinciple: '动片在电阻体上滑动，改变分压比。',
    applications: ['音量调节', '亮度控制', '传感器'],
    multimeterGuide: {
      steps: ['测两端总阻值', '测中间脚与一端变化'],
      expectedReading: '总阻值固定，中间脚阻值随旋转平滑变化。'
    },
    specs: [{ label: '阻值', value: '可变' }, { label: '线性', value: '线性/对数' }]
  },
  {
    id: 'var-001',
    name: '压敏电阻 (MOV)',
    type: ComponentType.VARISTOR,
    category: ComponentCategory.PASSIVE,
    description: '电压钳位元件，用于浪涌保护。',
    symbol: 'RV',
    workingPrinciple: '正常电压下呈高阻态；电压超过阈值时阻值急剧下降，泄放浪涌电流。',
    applications: ['防雷保护', '过压保护', '吸收尖峰'],
    multimeterGuide: {
      steps: ['电阻档测量两端'],
      expectedReading: '应为无穷大 (OL)。若有阻值则已损坏。'
    },
    specs: [{ label: '压敏电压', value: '470V' }, { label: '通流容量', value: 'kA级' }]
  },
  {
    id: 'fuse-001',
    name: '玻璃保险丝',
    type: ComponentType.FUSE,
    category: ComponentCategory.PASSIVE,
    description: '过流保护元件，一次性使用。',
    symbol: 'F',
    workingPrinciple: '电流产生的热量超过熔点时熔断。',
    applications: ['电源输入', '电机保护'],
    multimeterGuide: {
      steps: ['蜂鸣档测量'],
      expectedReading: '导通 (0Ω) 且蜂鸣。OL 为烧断。'
    },
    specs: [{ label: '电流', value: '2A' }, { label: '电压', value: '250V' }]
  },
  {
    id: 'xtal-001',
    name: '晶体振荡器',
    type: ComponentType.CRYSTAL,
    category: ComponentCategory.PASSIVE,
    description: '提供精准时钟信号的频率元件。',
    symbol: 'Y',
    workingPrinciple: '利用石英晶体的压电效应产生谐振。',
    applications: ['CPU时钟', 'RTC', '无线通讯'],
    multimeterGuide: {
      steps: ['万用表无法直接测好坏', '测引脚不应短路'],
      expectedReading: '需上电用示波器测波形。'
    },
    specs: [{ label: '频率', value: '8MHz' }, { label: '精度', value: 'ppm级' }]
  },
  {
    id: 'trans-001',
    name: '变压器',
    type: ComponentType.TRANSFORMER,
    category: ComponentCategory.PASSIVE,
    description: '利用电磁感应改变交流电压。',
    symbol: 'T',
    workingPrinciple: '初级线圈产生交变磁场，耦合到次级感应出电压。',
    applications: ['电压变换', '隔离', '阻抗匹配'],
    multimeterGuide: {
      steps: ['测各绕组通断', '测绕组间绝缘'],
      expectedReading: '绕组导通，绕组间无穷大。'
    },
    specs: [{ label: '变比', value: '220:12' }, { label: '功率', value: 'VA' }]
  },

  // --- 有源元件 ---
  {
    id: 'dio-001',
    name: '整流二极管',
    type: ComponentType.DIODE,
    category: ComponentCategory.ACTIVE,
    description: '单向导电元件，电流的单行道。',
    symbol: 'D',
    workingPrinciple: 'PN结正偏导通，反偏截止。',
    applications: ['整流', '防反接', '钳位'],
    multimeterGuide: {
      steps: ['二极管档测正反向'],
      expectedReading: '正向约 0.6V，反向 OL。'
    },
    specs: [{ label: '正向压降', value: '0.7V' }, { label: '反向耐压', value: '1000V' }]
  },
  {
    id: 'zener-001',
    name: '稳压二极管',
    type: ComponentType.ZENER_DIODE,
    category: ComponentCategory.ACTIVE,
    description: '工作在反向击穿区的二极管，用于稳定电压。',
    symbol: 'ZD',
    workingPrinciple: '反向击穿后，电流变化很大而电压基本不变。',
    applications: ['基准电压', '过压保护', '电平转换'],
    multimeterGuide: {
      steps: ['二极管档测正向', '反向也可能有读数(视稳压值)'],
      expectedReading: '正向约 0.7V。'
    },
    specs: [{ label: '稳压值', value: '5.1V' }, { label: '功率', value: '1W' }]
  },
  {
    id: 'led-001',
    name: '发光二极管',
    type: ComponentType.LED,
    category: ComponentCategory.ACTIVE,
    description: '电能转光能的半导体器件。',
    symbol: 'LED',
    workingPrinciple: '电子与空穴复合释放光子。',
    applications: ['指示', '照明', '显示'],
    multimeterGuide: {
      steps: ['二极管档，长脚接红'],
      expectedReading: '微亮，显示压降(1.8-3V)。'
    },
    specs: [{ label: '颜色', value: '红/绿/蓝' }, { label: '电流', value: '20mA' }]
  },
  {
    id: 'bjt-001',
    name: 'NPN 三极管',
    type: ComponentType.TRANSISTOR,
    category: ComponentCategory.ACTIVE,
    description: '电流控制器件，具有放大和开关作用。',
    symbol: 'Q',
    workingPrinciple: '小基极电流控制大集电极电流 (Ib 控制 Ic)。',
    applications: ['放大', '开关', '振荡'],
    multimeterGuide: {
      steps: ['二极管档测 BE, BC 结'],
      expectedReading: 'BE, BC 导通，CE 不通。'
    },
    specs: [{ label: 'Hfe', value: '100-300' }, { label: 'Vceo', value: '45V' }]
  },
  {
    id: 'mos-001',
    name: 'MOSFET (场效应管)',
    type: ComponentType.MOSFET,
    category: ComponentCategory.ACTIVE,
    description: '电压控制器件，输入阻抗极高，开关速度快。',
    symbol: 'Q/M',
    workingPrinciple: '通过栅极电压 (Vgs) 形成导电沟道控制漏极电流 (Id)。',
    applications: ['高速开关', '电源管理', '电机驱动'],
    multimeterGuide: {
      steps: ['二极管档测 DS (体二极管)', '触发 G 极看 DS 是否导通'],
      expectedReading: 'DS 正向有压降。G 极充上电后 DS 导通 (0Ω)。'
    },
    specs: [{ label: 'Vds', value: '60V' }, { label: 'Rds(on)', value: '10mΩ' }]
  },
  {
    id: 'ic-001',
    name: 'NE555 定时器',
    type: ComponentType.IC,
    category: ComponentCategory.ACTIVE,
    description: '经典的定时/振荡集成电路。',
    symbol: 'U',
    workingPrinciple: '内部集成比较器、触发器，外接阻容决定频率。',
    applications: ['定时', 'PWM', '脉冲发生'],
    multimeterGuide: {
      steps: ['测电源对地阻值'],
      expectedReading: '非短路。具体功能需上电测试。'
    },
    specs: [{ label: '封装', value: 'DIP-8' }, { label: '电压', value: '5-15V' }]
  },
  {
    id: 'opto-001',
    name: '光电耦合器 (PC817)',
    type: ComponentType.OPTOCOUPLER,
    category: ComponentCategory.ACTIVE,
    description: '以光为媒介传输电信号，实现电气隔离。',
    symbol: 'U/OC',
    workingPrinciple: '输入端 LED 发光，输出端光敏三极管受光导通。',
    applications: ['反馈电路', '隔离控制', '电平转换'],
    multimeterGuide: {
      steps: ['测输入端 LED', '测输出端三极管'],
      expectedReading: '输入端像二极管。输出端无光时不通。'
    },
    specs: [{ label: '隔离电压', value: '5000V' }, { label: 'CTR', value: '50%' }]
  },

  // --- 机电/传感器 ---
  {
    id: 'rel-001',
    name: '电磁继电器',
    type: ComponentType.RELAY,
    category: ComponentCategory.ELECTROMECHANICAL,
    description: '小电流控制大电流的机械开关。',
    symbol: 'K',
    workingPrinciple: '线圈通电产生磁力吸合触点。',
    applications: ['家电控制', '工业控制'],
    multimeterGuide: {
      steps: ['测线圈阻值', '测触点通断'],
      expectedReading: '线圈有阻值。常闭通，常开断。'
    },
    specs: [{ label: '线圈', value: '12VDC' }, { label: '负载', value: '10A 250V' }]
  },
  {
    id: 'spk-001',
    name: '蜂鸣器 (Buzzer)',
    type: ComponentType.SPEAKER,
    category: ComponentCategory.ELECTROMECHANICAL,
    description: '将电信号转换为声音信号的器件。',
    symbol: 'LS/B',
    workingPrinciple: '压电效应或电磁感应推动振膜振动发声。',
    applications: ['报警', '按键音', '音乐'],
    multimeterGuide: {
      steps: ['电阻档测线圈'],
      expectedReading: '有一定阻值（电磁式）。'
    },
    specs: [{ label: '类型', value: '有源/无源' }, { label: '电压', value: '5V' }]
  },
  {
    id: 'sw-001',
    name: '轻触开关',
    type: ComponentType.SWITCH,
    category: ComponentCategory.ELECTROMECHANICAL,
    description: '按压接通，松开断开的瞬动开关。',
    symbol: 'S/SW',
    workingPrinciple: '机械弹片接触导通。',
    applications: ['人机交互', '复位', '控制'],
    multimeterGuide: {
      steps: ['蜂鸣档，按下开关'],
      expectedReading: '按下响，松开不响。'
    },
    specs: [{ label: '寿命', value: '10万次' }, { label: '行程', value: '0.25mm' }]
  }
];
