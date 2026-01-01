import * as XLSX from 'xlsx';
import type { DrawRecord } from '../types';

/**
 * 导出中奖名单到 Excel
 */
export function exportToExcel(drawHistory: DrawRecord[], filename: string = '中奖名单'): void {
  // 准备数据
  const data: Array<{
    序号: number;
    中奖号码: string;
    抽取时间: string;
    奖项?: string;
  }> = [];

  let index = 1;
  drawHistory.forEach((record) => {
    record.numbers.forEach((number) => {
      data.push({
        序号: index++,
        中奖号码: number.toString(),
        抽取时间: new Date(record.timestamp).toLocaleString('zh-CN'),
        奖项: record.prize || '',
      });
    });
  });

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // 设置列宽
  ws['!cols'] = [
    { wch: 8 },  // 序号
    { wch: 12 }, // 中奖号码
    { wch: 20 }, // 抽取时间
    { wch: 15 }, // 奖项
  ];

  // 添加工作表
  XLSX.utils.book_append_sheet(wb, ws, '中奖名单');

  // 导出文件
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);
}

/**
 * 复制中奖名单到剪贴板
 */
export async function copyToClipboard(drawHistory: DrawRecord[]): Promise<void> {
  const text = drawHistory
    .map((record, index) => {
      const numbers = record.numbers.join(', ');
      const time = new Date(record.timestamp).toLocaleString('zh-CN');
      return `${index + 1}. ${numbers} (${time})`;
    })
    .join('\n');

  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // 降级方案：使用传统方法
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

