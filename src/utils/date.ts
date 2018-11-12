export const getDateTimestamp = (): number => {
    var d = new Date();
    var year = d.getFullYear()
    var month = d.getMonth();
    var day = d.getDate();
    return new Date(year, month, day, 0, 0, 0, 0).getTime();
 }