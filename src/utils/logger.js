export function logger(title, value) {
  console.log(
    `%c${title}%c${value}`,
    'background-color: #2d8cf0;color: white;padding: 2px 5px;border-radius: 4px 0 0 4px;border: 1px solid #2d8cf0;',
    'border: 1px solid #2d8cf0;padding: 2px 5px;border-radius: 0 4px 4px 0;color: #2d8cf0;background: white;'
  )
}
