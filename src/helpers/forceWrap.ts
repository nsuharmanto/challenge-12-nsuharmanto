export function forceWrapLongWords(text: string, maxLen = 35): string {
  return text.replace(new RegExp(`(\\S{${maxLen},})`, 'g'), (match) => {
    return match.replace(new RegExp(`(.{1,${maxLen}})`, 'g'), '$1\u200B');
  });
}