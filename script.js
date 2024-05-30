"use strict";

const months = [
  `January`,
  `February`,
  `March`,
  `April`,
  `May`,
  `June`,
  `July`,
  `August`,
  `September`,
  `October`,
  `November`,
  `December`,
];

const form = document.querySelector(`.form`);
const containerWorkouts = document.querySelector(`.workouts`);
const inputType = document.querySelector(`.form__input--type`);
const inputDistance = document.querySelector(`.form__input--distance`);
const inputDuration = document.querySelector(`.form__input--duration`);
const inputCadence = document.querySelector(`.form__input--cadence`);
const inputElevation = document.querySelector(`.form__input--elevation`);

class Workout {
  date = new Date();
  id = Date.now();

  constructor(coordinates, distance, duration) {
    this.coordinates = coordinates; //[lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }
}

class Running extends Workout {
  constructor(coordinates, distance, duration, cadence) {
    super(coordinates, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance; //in min/km
  }
}

class Cycling extends Workout {
  constructor(coordinates, distance, duration, elevationGain) {
    super(coordinates, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = (this.distance * 60) / this.duration; //in km/h
  }
}

class App {
  #map;
  #mapEvent;

  constructor() {
    this.#getPosition();
    form.addEventListener(`submit`, this.#newWorkout.bind(this));
    inputType.addEventListener(`change`, this.#toggleElevationField);
  }

  #getPosition() {
    navigator.geolocation.getCurrentPosition(
      this.#loadMap.bind(this),
      function () {
        alert(`Could not get your location!`);
      }
    );
  }

  #loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coordinates = [latitude, longitude];

    this.#map = L.map("map").setView(coordinates, 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(`click`, this.#showForm.bind(this));
  }

  #showForm(mpEvent) {
    form.classList.remove(`hidden`);
    inputDistance.focus();

    this.#mapEvent = mpEvent;
  }

  #toggleElevationField() {
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  #newWorkout(formEvent) {
    formEvent.preventDefault();

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ``;

    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
        })
      )
      .setPopupContent(`Workout`)
      .openPopup();
  }
}

const app = new App();
