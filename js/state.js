const AppState = {
  currentCollection: null,
  selectedPhotos: [],
  chosenOrientation: null,
  chosenSize: null,
  chosenCover: null,

  reset() {
    this.currentCollection = null;
    this.selectedPhotos = [];
    this.chosenOrientation = null;
    this.chosenSize = null;
    this.chosenCover = null;
  }
};

window.AppState = AppState;
