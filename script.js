'use strict';

const form = document.querySelector('.form');
const containerPlaces = document.querySelector('.places');
const inputType = document.querySelector('.form__input--type');
const inputOther = document.querySelector('.form__input--other');
const inputDistance = document.querySelector('.form__input--distance');
const inputStatus = document.querySelector('.form__input--status');
const inputName = document.querySelector('.form__input--name');
//const inputContant = document.querySelector('.form__input--contact');
const inputContact = document.querySelector('.form__input--contact');
const selectElement = document.getElementById('view--section');

//we can create a common class for all options as there is only one difference between them..(status)
class saveLocation {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, name, contact) {
    this.coords = coords;
    this.distance = distance;
    this.name = name;
    this.contact = contact;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.name[0].toUpperCase()}${this.name.slice(
      1
    )}, saved on ${months[this.date.getMonth()]} ${this.date.getDate()} `;
  }
}

class business extends saveLocation {
  type = inputType.value;
  constructor(coords, distance, name, contact) {
    super(coords, distance, name, contact);
    //    this.calcStatus();
    this._setDescription();
  }
}
//   calcStatus() {
//     const today = new Date();
//     const time = today.getHours();
//     time < 23 && time > 10
//       ? (inputStatus.value = 'open')
//       : (inputStatus.value = 'closed');
//     inputStatus.disabled = true;
//   }
// }

// telephoneCheck() {
//   var a = /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(
//     this.contact
//   );
//   alert(a);
// }

//making them global as we need them in other functions
class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #locationList = [];
  marker;
  coords;
  coords1;
  constructor() {
    //beacuse we want to get the current location as soon as page is loaded and a constructor is called right away when page is loaded..so we place this method here
    this._getPosition();
    //we want our event handlers to be already loaded by the time we load the class.so we put them in constructors

    //to get local storage
    this._getLocalStorage();

    form.addEventListener('submit', this._newLocation.bind(this));

    //when event func is called the this keyword is the doc. obj that called it..so here it is form obj and now the app class doesnt point to func..so we bind this keyword
    //when emergency is selected ..the contact field changes to status
    //we target nearest parent to both..and its form row..so we add and remove classes of form row
    inputType.addEventListener('change', this._toggleStatus.bind(this));

    containerPlaces.addEventListener('click', this._moveToPop.bind(this));
  }
  _getPosition() {
    ///getting geolocation from geolocation api.its just like date and timers browser api
    if (navigator.geolocation) {
      //check if it actually exists in browser..then
      //get curr pos accepts 2 arg..one for successful fetch and other one if failed to fetch
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert(`could'nt load the page. Try again.`);
          //for failure
          //if location access denied we can again click on location symbol on top beside extentions and bookmark and allow location access to reload
        }
      );
    }
  }
  _getMap() {
    return this.#map;
  }

  _loadMap(position) {
    // console.log(position);
    const { latitude } = position.coords;
    //we can use positon.coords.latitude to get latitude but wwe can also do obj destructuring like above
    //var name should be same as obj original attr
    //latitude is name of attr in coords..so we have to use the same in destructuring
    const { longitude } = position.coords;
    //console.log(latitude, longitude);
    //returns obj with all details of current position
    //google maps have url with longitude and latitude and we can specify them to get that location..copy google maps of amy location and change long and latitude to our location
    const mapLocation = `https://www.google.com/maps/@${latitude},${longitude}`;
    //console.log(mapLocation);

    //code from leaflet viewmap
    //change all variables acc. to our code
    //setview accepts an arr of latitude and longitude..so create coords array and pass it...same for L.marker
    //const map = L.map('map').setView([51.505, -0.09], 13);
    this.coords = [latitude, longitude];
    this.#map = L.map('map').setView(this.coords, this.#mapZoomLevel);
    //same method used in movetopop() method to view map at coords mentioned

    //14 is zoomed value..we can change values for more closer or far look of map..we can use zoom buttons on map too
    //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //every px in map is a tile..so tile func loads the map
    //we can use any map..google map also...above we've used openstreet map(free map api)
    //we can check different styles of display in open street map too
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(this.coords)
      .addTo(this.#map)
      .bindPopup('Your Location.')
      .openPopup();

    //code from leaflet viewmap
    //map is an obj which is used throughout
    //even view map at beginning comes from it..we can log(map) and see map obj with all leaflet documentation methods ...we can use on() to add event to a map
    //we use marker var in create marker and on click func...so it is global
    //we 1st check if marker is already defined somewhere when map is clicked..if yes we remove it and make marker null...now we add new marker in create marker function /
    //cant use private var map in another normal func call..it will be undefined..so we use get map() method to define normal map var inside func.
    // console.log(this.#map);

    this.#map.on('click', this._showForm.bind(this));

    //from getlocalstorage function..
    //render location func as it is   copied here
    //calling that function gives errors
    this.#locationList.forEach(work => {
      L.marker(work.coords)
        .addTo(this.#map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${work.type}-popup`,
            //class created for running ele in css, classname method adds it to onj
          })
        );
    });
  }

  _showForm(mapE) {
    // console.log(this.#map);
    if (this.marker != null) {
      this.#map.removeLayer(this.marker);
    }
    //  console.log(MapE);
    this.#mapEvent = mapE;
    const { lat, lng } = this.#mapEvent.latlng;
    //     //latlng method returns the coords
    //     //we paste above popup code of css
    this.coords1 = [lat, lng];

    //this.createMarker(coords, coords1).bind(this);

    form.classList.remove('hidden');
    //we need to display form when any location on map is clicked
    inputName.focus();
    //the distance element is focussed after form is visible
    //CREATING MARKER
    let markerFrom = L.circleMarker(this.coords, {
      color: '#F00',
      radius: 10,
    });
    this.marker = L.circleMarker(this.coords1, {
      color: '#4AFF00',
      radius: 10,
    });
    let from = markerFrom.getLatLng();
    let to = this.marker.getLatLng();
    markerFrom.bindPopup('Delhi ' + from.toString());
    this.marker.bindPopup('Mumbai ' + to.toString());
    this.#map.addLayer(this.marker);
    this.#map.addLayer(markerFrom);
    getDistance(from, to);

    function getDistance(from, to) {
      var container = document.getElementById('distance');
      container.disabled = true;
      let val = (from.distanceTo(to).toFixed(0) / 1000).toFixed(1);
      if (val > 1000) {
        Math.trunc(val);
      }
      // console.log(val);
      container.value = val + ' km';

      //console.log(container);
    }
  }
  _hideForm() {
    inputName.value = inputContact.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleStatus() {
    function calcStatus() {
      const today = new Date();
      const time = today.getHours();
      if (time < 23 && time > 10) {
        return 'open';
      } else {
        return 'closed';
      }
    }

    let strUser = selectElement.value;
    if (strUser === 'emergency' || strUser === 'work') {
      //     inputStatus.closest('.form__row').classList.remove('form__row--hidden');
      alert(`generally open between 10am to 11pm.
now ${calcStatus()}`);
    }
  }

  _newLocation(e) {
    e.preventDefault();
    const input = inputType.value;
    // console.log(input);
    const name = inputName.value;
    const contact = inputContact.value;
    let a = /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/.test(
      contact
    );
    if (!a) {
      return alert('enter a proper mobile number');
    }
    if (!name) {
      return alert('enter a name/description');
    }
    const place = new business(
      this.coords1,
      Number.parseFloat(inputDistance.value),
      name,
      contact
    );
    //creating new obj of input type
    this.#locationList.push(place);
    //console.log(place);
    //console.log(this.#locationList);
    //console.log(place.id);
    //
    //
    //
    //
    //  console.log(this);
    //console.log(inputType.value);
    // console.log(place._setDescription);

    this._hideForm();
    this._renderLocation(place);
    this._renderLocationList(place);
    this._setLocalStorage();
  }

  _renderLocation(place) {
    //add pop up to selected location
    //const { lat, lng } = this.#mapEvent.latlng;
    //     //latlng method returns the coords
    //     //we paste above popup code of css
    //this.coords1 = [lat, lng];
    //we add our own customed popup...add to method adds func. to map and bindpopup creates a popup..
    //any func. is created by L. obj so we use it and define methods from documentation
    //we've already added css to the popup in css
    //this has no connection to create marker func..if we submit form at create marker position..we ger pinned marker and it is fixed to map
    console.log(place.coords);
    L.marker(this.coords1)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${place.type}-popup`,
          //class created for running ele in css, classname method adds it to onj
        })
      )
      .setPopupContent(`${place.name}. ${inputDistance.value} away.`)
      .openPopup();
  }

  _renderLocationList(place) {
    const html = `<li class="workout workout--${place.type}" data-id="${
      place.id
    }">
    <h2 class="workout__title">${place.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">🏃‍♂️</span>
      <span class="workout__value">${place.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${
        place.type === 'business' ? '👨‍💼' : '🧍'
      }</span>
      <span class="workout__unit">type:</span>
      <span class="workout__value">${place.type}</span>
    </div>
    <div class="workout__details">
    <span class="workout__icon">📞</span>
    <span class="workout__unit">dial:</span>
    <span class="workout__value">${place.contact}</span>
    
  </div>`;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPop(e) {
    //this method is called by add event listener method and not the class.so we cant access or change private memebers..so we cant directly access location list array
    //so we use bind func to pass on this object of current class
    //since in add event listener method..the this element is the ele calling the func..
    //we've called add event listener using containerplaces..so that is the this obj here
    //so we cant access app class private members with another this ele..so we bind the app class this in event listener
    //move to closest place parent...li element(renderLocationList()) has place(workout) class that has all elements in it..so we can move to closest parent there
    const placeElement = e.target.closest('.workout');
    //console.log(placeElement);
    if (!placeElement) return;
    const place = this.#locationList.find(
      //data id has unique id for every form ele..it is created by the time we are creating the object..so we cant create 2objs at a time..so every ele will have unique id
      //we've found closest form element to workout from our click..it goes to workout container..and the closest form we've clicked is our click itself..so it returns the form ele clicked//now we compare form ele id with our location list array id  and compare
      work => work.id === placeElement.dataset.id
    );
    //console.log(place);
    //    console.log(place);
    //we can use map's setview method to view the map now..we give the coords of the element selected and will view map
    // console.log(place.coords);
    // console.log(this.coords1);
    // console.log(this.coords);

    this.#map.setView(place.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('places', JSON.stringify(this.#locationList));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('places'));
    console.log(data);
    if (!data) return;

    this.#locationList = data;
    //this func is called right after page is loaded...in constructor func..at that time location list array is empty..so it'll just add the data from previously loaded page into location list array...if there is no previous page and this is the 1st time opening..then data is null..so it'll just return..else it'll have elements from lastly loaded page

    this.#locationList.forEach(work => {
      this._renderLocationList(work);

      //render location wont work here...we are calling this func right in constructor..ie starting of page
      //so map is not yet loaded at this point..so we cant use render location before map is loaded..so we copy this func call and place it right after the line when map is loaded
    });
    //this wont work
    //writing every piece of work in func will make it easy for us to call any work from any where..that is why we have moved render location out from set location func
  }

  reset() {
    localStorage.removeItem('places');
    location.reload();
  }
}

const app = new App();
// function getDistance(from, to) {
//   var container = document.getElementById('distance');
//   container.disabled = true;
//   let val = (from.distanceTo(to).toFixed(0) / 1000).toFixed(1);
//   if (val > 1000) {
//     Math.trunc(val);
//   }
//   // console.log(val);
//   container.value = val + ' km';

//   //console.log(container);
// }
