const AppState = {
  currentCollection: null,
  selectedPhotos: [],
  chosenOrientation: null,
  chosenSize: null,
  chosenCover: null,
  autofill: true,

  reset() {
    this.currentCollection = null;
    this.selectedPhotos = [];
    this.chosenOrientation = null;
    this.chosenSize = null;
    this.chosenCover = null;
    this.autofill = true;
  }
};

window.AppState = AppState;
