
/**
 * @description convert any data to number
 * @param data
 * @returns result in number
 */
export const convertToNumber = (data: any) => { 
    let trimData = data.trim();
    let result = trimData.replace(/[(),]/g, '');    // remove , () from given data points
    return (+result)
}