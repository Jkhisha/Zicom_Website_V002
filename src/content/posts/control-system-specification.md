---json
{
  "id": "control-system-specification",
  "slug": "control-system-specification",
  "href": "/resources/specification-guides/control-system-specification",
  "type": "guide",
  "title": "What a good control system specification contains",
  "summary": "Architecture, I/O, safety, interfaces, security, lifecycle.",
  "date": "[TBC]",
  "author": "[TBC]",
  "image": {
    "src": "/images/80-mmscfd-compressor-station-titas-loce-1.jpg",
    "alt": "Gas compressor package with cooler at Titas LOC-E"
  },
  "body": [
    {
      "type": "richtext",
      "text": "[TBC: introduction]"
    },
    {
      "type": "list",
      "title": "Put this in your tender",
      "items": [
        "The SIS shall be physically and functionally independent of the BPCS, per IEC 61511.",
        "State the target SIL for each safety instrumented function, with verification calculations at FAT.",
        "All process data shall be exposed over OPC UA or Modbus TCP without licence restriction.",
        "Declare spare I/O capacity of not less than 20% per cabinet, wired to terminals.",
        "State the declared product support horizon and the migration path at end of life.",
        "Design shall target IEC 62443 Security Level 2 as a minimum."
      ]
    }
  ]
}
---
