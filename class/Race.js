module.exports = class Race {
  constructor(name, date, track, length, price){
    this.name = name || "";
    this.date = date;
    this.track = track || "";
    this.length = length || 0;
    this.price = price || 0;
    this.horses = [];
  }

  addHorse(...horses) {
    this.horses.push(...horses);
  }
}