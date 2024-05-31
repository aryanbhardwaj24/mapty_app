"use strict";

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

  setDescription() {
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

    this.description = `${
      this.type.slice(0, 1).toUpperCase() + this.type.slice(1)
    } on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = `running`;

  constructor(coordinates, distance, duration, cadence) {
    super(coordinates, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this.setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance; //in min/km
  }
}

class Cycling extends Workout {
  type = `cycling`;

  constructor(coordinates, distance, duration, elevationGain) {
    super(coordinates, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this.setDescription();
  }

  calcSpeed() {
    this.speed = (this.distance * 60) / this.duration; //in km/h
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 14;

  constructor() {
    this.#getPosition();
    this.#getLocalStorage();
    form.addEventListener(`submit`, this.#newWorkout.bind(this));
    inputType.addEventListener(`change`, this.#toggleElevationField);
    containerWorkouts.addEventListener(`click`, this.#moveToPopup.bind(this));
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

    this.#map = L.map("map").setView(coordinates, this.#mapZoomLevel);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(`click`, this.#showForm.bind(this));
    this.#workouts.forEach((workout) => this.#renderWorkoutMarker(workout));
  }

  #showForm(mpEvent) {
    form.classList.remove(`hidden`);
    inputDistance.focus();

    this.#mapEvent = mpEvent;
  }

  #hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ``;

    form.style.display = `none`;
    form.classList.add(`hidden`);
    setTimeout(() => (form.style.display = `grid`), 1000);
  }

  #toggleElevationField() {
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  #newWorkout(formEvent) {
    formEvent.preventDefault();

    const validInputs = (...inputs) => {
      return inputs.every((inp) => Number.isFinite(inp));
    };

    const positiveInputs = (...inputs) => {
      return inputs.every((inp) => inp > 0);
    };

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === `running`) {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, duration, cadence) ||
        !positiveInputs(distance, duration, cadence)
      )
        return alert(`Inputs have to be positive numbers!`);

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    if (type === `cycling`) {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !positiveInputs(distance, duration)
      )
        return alert(`Inputs have to be positive numbers!`);

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);
    this.#renderWorkout(workout);
    this.#renderWorkoutMarker(workout);
    this.#setLocalStorage();
  }

  #renderWorkoutMarker(workout) {
    L.marker(workout.coordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === `running` ? `🏃🏻‍♂️` : `🚴🏻`} ${workout.description}`
      )
      .openPopup();
  }

  #renderWorkout(workout) {
    this.#hideForm();

    let html = `
      <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === `running` ? `🏃🏻‍♂️` : `🚴🏻`
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === `running`) {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(2)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      `;
    }

    if (workout.type === `cycling`) {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(2)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      `;
    }

    form.insertAdjacentHTML(`afterend`, html);
  }

  #moveToPopup(event) {
    const workoutElement = event.target.closest(`.workout`);

    if (!workoutElement) return;

    const workout = this.#workouts.find(
      (work) => work.id === Number(workoutElement.dataset.id)
    );

    this.#map.setView(workout.coordinates, this.#mapZoomLevel, {
      animate: true,
      duration: 1,
    });
  }

  #setLocalStorage() {
    localStorage.setItem(`workouts`, JSON.stringify(this.#workouts));
  }

  #getLocalStorage() {
    const data = JSON.parse(localStorage.getItem(`workouts`));

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach((workout) => {
      workout.__proto__ = Object.create(
        workout.type === `running` ? Running.prototype : Cycling.prototype
      );
      this.#renderWorkout(workout);
    });
  }

  reset() {
    localStorage.removeItem(`workouts`);
    location.reload();
  }
}

const app = new App();
