const c = 22
function rua() {
    const a = 233 + c
    return () => {
        const b = 456
        return a
    }
}

module.exports = {
    rua
}