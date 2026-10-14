import type { Reference } from '@/types/mineral';

// 标准矿物学参考文献
// 所有数值均来自以下权威来源之一，并在 mineral.ts 的 PropertySource 中标注
export const REFERENCES: Record<string, Reference> = {
  nesse2013: {
    id: 'nesse2013',
    type: 'textbook',
    authors: 'Nesse, W. D.',
    title: 'Introduction to Optical Mineralogy, 4th Edition',
    year: '2013',
    publisher: 'Oxford University Press',
    pages: '全册',
  },
  dhz2013: {
    id: 'dhz2013',
    type: 'handbook',
    authors: 'Deer, W. A.; Howie, R. A.; Zussman, J.',
    title: 'Rock-Forming Minerals (5-volume set, 2nd Edition)',
    year: '2013',
    publisher: 'Geological Society of London',
  },
  mindat: {
    id: 'mindat',
    type: 'database',
    authors: 'Hudson Institute of Mineralogy',
    title: 'Mindat.org',
    url: 'https://www.mindat.org',
    accessed: '2026-10',
    license: 'CC BY-NC-SA 3.0 (data)',
  },
  rruff: {
    id: 'rruff',
    type: 'database',
    authors: 'Lafuente, B.; Downs, R. T.; Yang, H.; Stone, N.',
    title: 'The RRUFF Project: an integrated study of the chemistry, crystallography, Raman and infrared spectroscopy of minerals',
    year: '2015',
    url: 'https://rruff.info',
    accessed: '2026-10',
    license: 'CC BY 4.0',
  },
  changlihua2006: {
    id: 'changlihua2006',
    type: 'handbook',
    authors: '常丽华; 陈曼云; 王春艳; 等',
    title: '透明矿物薄片鉴定手册',
    year: '2006',
    publisher: '地质出版社',
    pages: '1-333',
  },
  klein2007: {
    id: 'klein2007',
    type: 'textbook',
    authors: 'Klein, C.; Dutrow, B.',
    title: 'Manual of Mineral Science, 23rd Edition',
    year: '2007',
    publisher: 'John Wiley & Sons',
  },
};

// 通用来源说明
export const SOURCE_NOTES = {
  birefringence:
    '双折射率数值依成分和切片方向变化，以下为典型值并标注来源；详细范围见对应文献。',
  cellParams:
    '晶胞参数依具体成分、温度和压力而变化；下列数值的适用条件在字段中标注。',
};