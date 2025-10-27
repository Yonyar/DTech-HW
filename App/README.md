# DTech - App
> 🏠 A Progressive Web App (PWA) for managing smart home devices with real-time updates.

## 🛠 Technology Stack
| **Layer**        | **Technology**                  |
| ---------------- | ------------------------------- |
| Backend          | Node.js v12.11                  |
| Frontend         | Angular v10                     |
| Database         | Firebase                        |
| Containerization | Docker                          |

## 🎯 Project Goals   
Connecting all parts of the repository (Hardware, ESP32 & RaspberryPi) to obtain a intuitive App for Home Automation aplication:

- Full-stack development with Angular and Node.js
- Designing usable and reactive interfaces
- Implementing CRUD workflows
- Structuring scalable and maintainable projects
- Integrating Firebase real-time database for dynamic data handling   

## ✨ Features

### 🌐 PWA Ready     
Installable on mobile devices.

### 🛠 Cross-Platform   
Works on desktops, tablets, and smartphones.     

### 🔒 Secure Access  
Role-based authentication for safe device management.    
![login](/App/src/assets/gif/login.gif)      

### Custom splashscreen   
![Splashscreen](/App/src/assets/gif/splash.gif)    

### 💠 Interactive Simplicity   

|Intuitive and responsive design that adapts seamlessly across devices, offering a smooth, engaging, and user-friendly experience. | For RGB lights it's possible to save favorite colors. Smart and quickly control state and brighness of devices |    
|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| ![Interactive](/App/src/assets/gif/interactive.gif)                             | ![Light Control](/App/src/assets/gif/lights.gif)                                |


|Edit name and room for devices, or remove them. It's posible to select transit function: use PIR sensor motion if available | Switches can be easily linked to several lights. Switches are wireless and power by 12V |
|---------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| ![Light Edit](/App/src/assets/gif/edit.gif)                                     | ![Switch Control](/App/src/assets/gif/edit-switch.gif)                          |

### 🔧 Easy Device Management   
Thanks to logic implementing on [ESP32](https://github.com/jc-delrio/DTech/tree/main/ESP32) and [RaspberryPi server](https://github.com/jc-delrio/DTech/tree/main/RaspberryPi), firebase real-time database can **auto-detect** current state of devices effortlessly.    
![Connect Device](/App/src/assets/gif/connect.gif)   

### ⚡ Real-Time Updates    
Instant device status changes reflected in the UI.    
