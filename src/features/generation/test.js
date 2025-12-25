class Animal {
  move() {
    console.log('move');
  }
}

class Dog extends Animal {
  bark() {
    console.log('bark');
  }
  move() {
    super.move();
    console.log('but fast');
  }
}

class Snail extends Animal {
  move() {
    super.move();
    console.log('but slow');
  }
}

const dog1 = new Dog();
const snail = new Snail();

dog1.move();
snail.move();
