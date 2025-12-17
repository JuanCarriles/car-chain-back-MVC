// Test de la función de fechas
const now = new Date();
console.log("Fecha actual:", now.toISOString());
console.log("Año actual:", now.getFullYear());
console.log("Mes actual:", now.getMonth()); // 0-indexed

for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
    const date = new Date(now.getFullYear(), now.getMonth(), 1);
    date.setMonth(date.getMonth() - monthsAgo);

    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
    date.setDate(randomDay);

    console.log(`monthsAgo=${monthsAgo}: ${date.toISOString().split('T')[0]} (mes ${month + 1}/${year})`);
}
