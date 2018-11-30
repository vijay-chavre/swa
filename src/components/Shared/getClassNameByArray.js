export default function getClassNameByArray(classNames: string[]) {
  // Remove falsey class names from array, and then join with a space delimiter
  return classNames
    .filter(className => !!className)
    .join(' ');
}
