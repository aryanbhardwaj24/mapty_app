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

let map, mapEvent;

navigator.geolocation.getCurrentPosition(
  function (position) {
    const { latitude, longitude } = position.coords;
    const coordinates = [latitude, longitude];

    map = L.map("map").setView(coordinates, 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on(`click`, function (event) {
      form.classList.remove(`hidden`);
      inputDistance.focus();

      mapEvent = event;
    });
  },
  function () {
    alert(`Could not get your location!`);
  }
);

form.addEventListener(`submit`, function (formEvent) {
  formEvent.preventDefault();

  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      ``;

  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
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
});

inputType.addEventListener(`change`, function () {
  inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
});
