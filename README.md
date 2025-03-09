# Amazon Bid Master

End-to-End Bid Optimization & Analytics Tool for Amazon PPC Managers

## Features

- CSV data upload and processing
- Rule-based bid optimization engine
- Performance forecasting with ML
- Interactive dashboards and analytics
- Campaign management and monitoring

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express
- ML/Analytics: Custom forecasting algorithms
- Database: (To be implemented)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/amazon-bid-master.git
cd amazon-bid-master

2. Install dependencies
npm run install:all

3. Start Development server
npm run dev

The application will be available at http://localhost:5000 or http://127.0.0.1:5000/

Project Structure
amazon-bid-master/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   └── ...
├── server/              # Express backend
│   ├── routes/         # API routes
│   └── ...
├── shared/             # Shared types and utilities
│   ├── ml/            # Machine learning models
│   └── types/         # TypeScript types
└── ...