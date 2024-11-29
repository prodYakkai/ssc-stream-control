
export function inputChangeSnakeCase(e: Event): string {
    const input = e.target as HTMLInputElement;
    // Getting the current value of the input
    const currentValue = input.value;

    // Replacing spaces with underscores
    const modifiedValue = currentValue.replace(/ /g, '_');

    return modifiedValue;
}