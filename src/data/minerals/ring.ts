import type { Mineral } from '@/types/mineral';
import { M } from './helper';

/**
 * 环状硅酸盐（Cyclosilicates）
 * 电气石族、绿柱石、堇青石
 */
export const RING_MINERALS: Mineral[] = [
  M({
    id: 'tourmaline',
    nameCN: '电气石',
    nameEN: 'Tourmaline',
    aliases: ['黑电气石 schorl', '锂电气石 elbaite', '镁电气石 dravite'],
    formula: 'Na(Fe,Mg,Li,Al)₃Al₆(BO₃)₃Si₆O₁₈(OH)₄（族名，成分复杂）',
    mineralClass: '硅酸盐',
    silicateSubclass: '环状硅酸盐',
    crystal: {
      system: '三方晶系',
      pointGroup: '3m',
      habit: '柱状（横切面球面三角形），纵面具纵纹',
      cleavage: '{11ī0}与{0001}不完全，横裂纹发育',
      hardness: '7–7.5',
      density: '3.0–3.25 g/cm³',
    },
    optical: {
      ppl: {
        color: '蓝、蓝绿、褐、黑（黑电气石）等；核心-边缘色带（环带）常见',
        pleochroism: '强（吸收性极强，Ng 方向近不透明）：Ng 深色/Np 浅色',
        relief: '中-高突起',
        cleavage: '横裂纹（垂直 c 轴）比解理更醒目',
        form: '柱状自形，横切面呈特征球面三角形；纵纹显著',
        transparency: '透明至不透明（黑电气石）',
        alteration: '稳定，可蚀变为白云母、绿泥石',
      },
      xpl: {
        interferenceColor: '被吸收色掩盖（常显自身颜色）；实际 δ 中等',
        birefringence: 'δ = 0.018–0.034',
        extinction: '平行消光',
        twinning: '无',
        zoning: '纵向色带与横向环带都常见 —— 特征',
        notes: '球面三角形横切面+强吸收多色性+纵纹+色带环带',
      },
      conoscopic: { opticType: '一轴晶', opticSign: '负(−)', '2V': '0（一轴晶）' },
    },
    occurrence: '花岗岩、伟晶岩、气成热液脉、碎屑岩（重矿物）',
    associations: '石英、钠长石、白云母、锂辉石（伟晶岩）',
    distinguishing: '与黑云母：电气石无解理、柱状、吸收更强；一轴晶',
    dataStatus: 'verified',
  }),

  M({
    id: 'beryl',
    nameCN: '绿柱石',
    nameEN: 'Beryl',
    aliases: ['emerald 祖母绿', 'aquamarine 海蓝宝石'],
    formula: 'Be₃Al₂Si₆O₁₈',
    mineralClass: '硅酸盐',
    silicateSubclass: '环状硅酸盐',
    crystal: {
      system: '六方晶系',
      pointGroup: '6/mmm',
      spaceGroup: 'P6/mcc',
      cellParams: { a: '9.21 Å', c: '9.19 Å', alpha: '90°', beta: '90°', gamma: '120°', conditions: '常温' },
      habit: '六方长柱状自形晶',
      cleavage: '{0001}不完全',
      hardness: '7.5–8',
      density: '2.65–2.90 g/cm³',
    },
    optical: {
      ppl: {
        color: '无色（纯）；祖母绿绿色（Cr/V）、海蓝宝蓝色（Fe）',
        pleochroism: '有色变种显弱多色性：No 浅色/Ne 深色（或相反）',
        relief: '低-中突起（n ≈ 1.56–1.60）',
        cleavage: '解理不发育',
        form: '六方柱状自形晶',
        transparency: '透明',
        inclusions: '气液两相包裹体、固相包体常见',
      },
      xpl: {
        interferenceColor: '一级灰（低）',
        birefringence: 'δ = 0.004–0.009（低）',
        extinction: '平行消光（柱面）',
        twinning: '无',
      },
      conoscopic: { opticType: '一轴晶', opticSign: '负(−)', '2V': '0（一轴晶）' },
    },
    occurrence: '花岗伟晶岩、云英岩、高温热液脉',
    associations: '石英、钠长石、白云母、黄玉、萤石',
    distinguishing: '六方柱+低双折射+一轴负；与磷灰石：绿柱石柱更大、突起略低',
    dataStatus: 'verified',
  }),

  M({
    id: 'cordierite',
    nameCN: '堇青石',
    nameEN: 'Cordierite',
    aliases: ['iolite 堇青石宝石名'],
    formula: 'Mg₂Al₄Si₅O₁₈',
    mineralClass: '硅酸盐',
    silicateSubclass: '环状硅酸盐',
    crystal: {
      system: '斜方晶系（假六方）',
      pointGroup: 'mmm',
      habit: '假六方短柱状（常呈他形粒状）',
      cleavage: '{010}中等，{001}不完全',
      hardness: '7–7.5',
      density: '2.53–2.78 g/cm³',
    },
    optical: {
      ppl: {
        color: '无色；蚀变后混浊（含云母鳞片时呈斑点状黄色）',
        pleochroism: '弱：无色-淡黄-淡蓝（多色性弱于电气石）',
        relief: '低突起（n ≈ 1.53–1.56）',
        cleavage: '解理不显著',
        form: '他形粒状，横切面可呈假六边形',
        transparency: '透明',
        alteration: '蚀变为绢云母+胶蛇纹石混合（特征"假蛇纹石化"）',
        inclusions: '常含大量细小锆石（每颗带晕圈）+云母',
      },
      xpl: {
        interferenceColor: '一级灰至一级黄（低）',
        birefringence: 'δ = 0.008–0.018（多数 <0.01）',
        extinction: '平行消光；特征简单双晶/聚片双晶（假六方对称导致三连晶 60°/120°）',
        twinning: '{110}简单双晶+三连晶（呈 60° 三 sector）—— 特征',
        notes: '低压高温变质 + 锆石晕圈 + 三连晶双晶',
      },
      conoscopic: { opticType: '二轴晶', opticSign: '负(−) 或正(+)', '2V': '65°–90°（大，可变号）' },
    },
    occurrence: '角岩（接触变质泥质岩）、堇青石片麻岩（低压高温变质）',
    associations: '红柱石、钾长石、石英、白云母、矽线石',
    distinguishing: '与石英：堇青石有双晶、弱多色性、蚀变混浊；产状为泥质角岩',
    dataStatus: 'verified',
  }),
];
