# URL Health Monitor

A simple tool that allows users to check and monitor the health status of multiple URLs, showing whether websites are up or down along with their response times.

## Features

- GUI for inputting multiple URLs
- Backend logic to properly ping/check each URL
- Shows status (UP/DOWN) and response time for each URL
- Stores results for past checks using browser localStorage
- Displays statistics on URL health over time (uptime percentage, avg response time)
- Dockerized for easy deployment

## Project Structure

```
url-health-monitor/
│── index.html          # Main HTML page
│── css/
│   └── style.css       # Styling for the application
│── js/
│   └── main.js         # Frontend JavaScript logic
├── server.js               # Backend Node.js server
├── package.json            # Node.js dependencies
├── Dockerfile              # Docker configuration
└── README.md               # Project documentation
```

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **HTTP Client**: Axios
- **Storage**: Browser localStorage for history
- **Containerization**: Docker

## Installation and Setup

### Prerequisites

- Docker installed on your system
- OR Node.js and npm installed for local development

### Using Docker

1. Clone the repository:
   ```
   git clone <repository-url>
   cd url-health-monitor
   ```

2. Build the Docker image:
   ```
   docker build -t url-health-monitor .
   ```

3. Run the container:
   ```
   docker run -p 5000:5000 url-health-monitor
   ```

4. Access the application in your browser:
   ```
   http://localhost:5000
   ```


## How to Use

1. Enter one or more URLs in the input textarea (one URL per line)
2. Click the "Check Status" button
3. View the current status of URLs in the "Current Status" section
4. Check the "URL Health Statistics" section for uptime percentages and average response times
5. Review the "History" section for past checks

## API Endpoints

- `GET /api/health`: Check if the server is running
- `POST /api/check-urls`: Check the health of multiple URLs
  - Request body: `{ "urls": ["example.com", "https://google.com"] }`
  - Response: Array of URL check results

