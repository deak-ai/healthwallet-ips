# HealthWallet IPS

> ## ⚠️ DISCLAIMER
> **THIS IS A DEMO APPLICATION ONLY**
>
> This application is intended solely for demonstration purposes with synthetic patient data. It is **NOT** meant for any real medical or healthcare related purposes. Do not use with real patient data or in any healthcare setting. The application has not been tested or certified for medical use and may contain errors.


## Overview

A React Native mobile application built with Expo that serves as a smart health assistant for managing International Patient Summary (IPS) data using the FHIR standard.
I supports mapping FHIR resources to W3C Verifiable Credentials in close alignment with the Smart Health Card (SHC) specification allowing for this information
to be presented for instance when registering as a new patient at a medical practice.


## Features

- **International Patient Summary (IPS) Management**: View and manage your health data organized by IPS sections by loading the data from a FHIR server
  - Required sections: Allergies and Intolerances, Medication Summary, Problem List
  - Recommended sections: History of Procedures, Immunizations, Medical Devices, Results
  - Not yet implemented:
    - Optional sections: Vital Signs, Past History of Illness, Functional Status, Plan of Care, Social History, Pregnancy History, Advance Directives$
    - Additional sections: Alerts, Patient Story


- **Mapping of health information (FHIR resources) to Verifiable Credentials**: Integration with walt.id wallet infrastructure for secure credential storage and sharing.

- **QR Code Scanner**: Supports scanning of a OpenId4VP presenation request for a Smart Health Card and then to select exactly which pieces of health information to share.

- **Web Wallet Integration**: Direct access to the web-based wallet functionality of the walt.id infrastructure from within the app.

- **AI Agent**: Demo AI agent powered by Elevenlabs conversational agent to support Q&A on the patients health record, such as asking about which allergies, medications or problems a patient has. 

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Secure Storage**: Expo Secure Store
- **Web Integration**: WebView for walt.id web wallet and AI agent
- **Healthcare Standards**: FHIR, IPS
- **Credential Management**: walt.id wallet and issuer, verifier API's, Smart Health Cards

## Development

### Prerequisites

- Node.js
- Yarn (as specified in project requirements)
- Expo CLI

### Installation

1. Clone the repository
   ```
   git clone https://github.com/deak-ai/healthwallet-ips.git
   cd healthwallet-ips
   ```

2. Install dependencies using Yarn
   ```
   yarn install
   ```

3. Start the development server
   ```
   yarn dev
   ```

For development with Expo tunnel:
```
yarn dev-tunnel
```

### Building for Platforms

For Android:
```
yarn android
```

For iOS:
```
yarn ios
```

## Configuration

The application requires configuration for:

1. **Health Connector**: For patient data it currently only supports the synthetic patients generated for this project. All available patient samples (1000+) can be found here:
https://github.com/deak-ai/healthwallet-datasets/tree/main/fhir-examples/ips-fhir. The id to be configured in the app is the numerical value, for instance for 801941-ips.json, the id is 801941. Some patient samples are also inside the [resources](resources) folder.

2. **Wallet**: For credential management via walt.id services, a username and password needs to be created on https://webdev.healthwallet.li and then configured in the. 


**Attention:** 
* Once a wallet and patient has been configured, it is important to run the "Health Data Sync" command from the Wallet Settings page. The first time this is run it will create Verifiable Credentials for all health data present. For performance reasons, the Results section is currently not enabled. 
* Also, before using the QR code scanner to scan a presentation, the Health Data Sync command needs to be run manually. This should be improved in the future.



## License

MIT License

## Contributors

Oliver Deak (cto@deak.ai)
Nawress Brigui (Wind Consulting, Tunisia)