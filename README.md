# llperf-graph

**English** | [Русский](README-ru.md)

Interactive visualizer for llperf benchmark reports. Displays system activity timelines, parallelism, and throughput metrics with support for multiple report comparison.

## Features

- **Request Timeline**: Gantt chart showing each request's phases (model load, prefill, generation, overhead)
- **Parallelism Tracking**: Active requests by phase at each moment
- **Throughput Analysis**: Total and per-request generation speed over time
- **Statistical Comparison**: Box plots comparing multiple benchmark runs
- **Interactive Exploration**: Zoom, pan, hover tooltips, request selection
- **Multi-Report Support**: Load and compare multiple benchmarks side-by-side
- **Bilingual Interface**: Full English and Russian localization

## Quick Start

### Option 1: Local File

Open `index.html` directly in a web browser. Use "Add report..." button or drag-and-drop JSON files.

### Option 2: Local Server (Recommended)

```bash
python3 -m http.server
# Open http://localhost:8000
```

Server mode enables:
- Auto-loading reports from `reports.json` manifest
- URL parameters: `?file=report1.json&file=report2.json`
- Directory listing for automatic report discovery

## Usage

### Loading Reports

- **Manual**: Click "Add report..." or drag JSON files into the window
- **Auto-load**: Place `reports.json` in the same directory:
  ```json
  ["report1.json", "report2.json"]
  ```
- **URL parameters**: `?file=report.json` (multiple allowed)

### Navigation

- **Mouse wheel** over charts: zoom in/out around cursor
- **Drag**: pan timeline
- **Double-click**: reset to full run
- **Hover**: synchronized cursor across all charts with tooltip
- **Click on request**: toggle selection
- **Keyboard**:
  - `←` / `→`: shift timeline
  - `+` / `-`: zoom
  - `0`: reset to full run
  - `Esc`: clear selection

### Interface

- **Tabs** at top: switch between loaded reports
- **×** on tab: unload report
- **"Close all"**: unload all reports
- **Drag tab**: reorder (affects comparison table order)
- **Language selector**: EN/RU in top-right corner
- **?** buttons: context help for each section

### Views

#### Summary Tab
- **Compare Runs**: Table comparing all loaded reports
- **Statistical Comparison**: Box plots for generation speed and parallel throughput

#### Details Tab
- **Run Results**: Key metrics cards
- **Run Overview**: Minimap for window selection
- **System Activity**: Timeline, parallelism, and throughput charts
- **Window Statistics**: Metrics for selected time range
- **Run Parameters**: Configuration and computed values
- **Requests**: Detailed table (sortable, filterable)

## Report Format

The visualizer expects JSON files with the following structure:

```json
{
  "metrics": [
    {
      "request_start_time_ns": 1234567890,
      "request_end_time_ns": 1234567890,
      "prompt_length": 100,
      "response_length": 50,
      "model_load_ns": 1000000,
      "prompt_processing_ns": 2000000,
      "generation_ns": 5000000,
      "ttft_ns": 3000000
    }
  ],
  "config": {
    "model": "model-name",
    "parallel_size": 4
  },
  "summary": {
    "avg_response_tps": 25.5,
    "p50_response_tps": 24.8,
    "avg_prompt_tps": 1200
  }
}
```

### Required Fields (per metric)
- `request_start_time_ns`: Request start timestamp
- `request_end_time_ns`: Request end timestamp
- `prompt_length`: Number of prompt tokens
- `response_length`: Number of generated tokens

### Optional Fields
- `model_load_ns`: Time spent loading model
- `prompt_processing_ns`: Prefill time
- `generation_ns`: Generation time
- `ttft_ns`: Time to first token
- `config`: Model configuration object
- `summary`: Pre-computed statistics

## Phase Model

Each request is divided into phases:
1. **Model Load**: Loading model into memory
2. **Prefill**: Processing input prompt
3. **Generation**: Generating output tokens
4. **Overhead**: Network, queuing, other delays

Phases are calculated from timestamps and displayed with distinct colors in the timeline.

## Metrics

### Calculated Metrics
- **Duration**: Wall-clock time from first request start to last request end
- **Parallelism**: Average number of concurrent active requests
- **Total Generation**: System throughput in tok/s (sum of all parallel generation)
- **Per-Request Speed**: Individual request generation speed
- **Prefill Speed**: Prompt processing throughput
- **Idle Time**: Time when no requests are active

### Window Statistics
All metrics can be computed for a selected time window by zooming into the timeline.

## Browser Compatibility

Tested on modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires JavaScript and Canvas API support.

## Files

- `index.html`: Main page (658 lines)
- `app.js`: Application logic (2147 lines)
- `styles.css`: Styles (194 lines)
- `reports.json`: Optional manifest for auto-loading

## Localization

The interface supports English and Russian. Language selection is persisted in browser localStorage.

To add a new language:
1. Add translations to the `LANG` object in `app.js`
2. Add help sections with `data-lang` attribute in `index.html`
3. Update language selector in the header

## License

See LICENSE file for details.
