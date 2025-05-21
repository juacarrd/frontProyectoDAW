// setupWebClient.js
const fs = require('fs');
const path = require('path');

const structure = {
  'web-client': {
    'index.html': '',
    views: {
      'mainMenu.html': '',
      'facilities.html': '',
      'booking.html': '',
      'myBookings.html': '',
      'qr.html': ''
    },
    controllers: {
      'AuthController.js': '',
      'FacilityController.js': '',
      'BookingController.js': ''
    },
    models: {
      'ApiService.js': '',
      'LoggedUserDTO.js': '',
      'BookingDTO.js': '',
      'FacilityDTO.js': '',
      'FacilityTypes.js': ''
    },
    styles: {
      'style.css': ''
    },
    scripts: {
      'router.js': ''
    }
  }
};

function createStructure(basePath, obj) {
  for (const key in obj) {
    const currentPath = path.join(basePath, key);
    if (typeof obj[key] === 'string') {
      fs.writeFileSync(currentPath, obj[key]);
    } else {
      if (!fs.existsSync(currentPath)) fs.mkdirSync(currentPath);
      createStructure(currentPath, obj[key]);
    }
  }
}

createStructure('.', structure);

console.log('Estructura del cliente web creada con éxito en ./web-client');
