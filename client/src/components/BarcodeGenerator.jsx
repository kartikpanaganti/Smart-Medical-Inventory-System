import React, { useState, useRef, useEffect } from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { PrinterIcon, QrCodeIcon, DocumentDuplicateIcon, ViewfinderCircleIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import BarcodeScanner from './BarcodeScanner';

// Create a separate printable component
const PrintableBarcode = ({ codeType, medicine, copies, size, sizeConfigs }) => {
  // Function to create minimal QR data
  const createMinimalQRData = (medicine) => {
    return JSON.stringify({
      id: medicine._id,
      name: medicine.name,
      barcode: medicine.barcode || ''
    });
  };

  return (
    <div className="p-4 print-container">
      <div className="grid gap-4 grid-cols-2">
        {[...Array(copies)].map((_, index) => (
          <div key={index} className="barcode-container p-4 border border-gray-200 rounded text-center">
            {codeType === 'barcode' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Barcode
                  value={medicine.barcode || `MED${medicine._id.slice(-4)}`}
                  width={sizeConfigs[size].width}
                  height={sizeConfigs[size].height}
                  fontSize={sizeConfigs[size].fontSize}
                  displayValue={false}
                />
                <div style={{ marginTop: '8px', fontSize: sizeConfigs[size].fontSize, textAlign: 'center', fontWeight: '500' }}>
                  {medicine.barcode || `MED${medicine._id.slice(-4)}`}
                </div>
                <div style={{ marginTop: '8px', fontSize: sizeConfigs[size].fontSize, textAlign: 'center', fontWeight: '500' }}>
                  {medicine.name}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <QRCodeSVG
                  value={createMinimalQRData(medicine)}
                  size={sizeConfigs[size].qrSize}
                  level="M"
                  includeMargin={true}
                />
                <div style={{ marginTop: '8px', fontSize: sizeConfigs[size].fontSize, textAlign: 'center', fontWeight: '500' }}>
                  {medicine.name}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BarcodeGenerator = ({ medicine, onClose }) => {
  const [barcodeType, setBarcodeType] = useState('barcode');
  const [copies, setCopies] = useState(1);
  const [size, setSize] = useState('medium');
  const [columns, setColumns] = useState(5);
  const [showScanner, setShowScanner] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printContainerRef = useRef(null);
  const printFrameRef = useRef(null);

  // Size configurations for different barcode sizes
  const sizeConfigs = {
    small: { width: 1.5, height: 30, fontSize: 9, margin: 2, qrSize: 60 },
    medium: { width: 2.5, height: 50, fontSize: 11, margin: 3, qrSize: 90 },
    large: { width: 4.0, height: 80, fontSize: 13, margin: 4, qrSize: 120 }
  };

  // Function to create minimal QR data to prevent overflow
  const createMinimalQRData = (medicine) => {
    return JSON.stringify({
      id: medicine._id,
      name: medicine.name,
      barcode: medicine.barcode || ''
    });
  };

  // Create the print frame on component mount
  useEffect(() => {
    // Create an iframe for printing if it doesn't exist
    if (!printFrameRef.current) {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.left = '-9999px';
      iframe.name = 'print-frame-' + Date.now();
      iframe.id = iframe.name;
      document.body.appendChild(iframe);
      printFrameRef.current = iframe;
    }
    
    // Clean up on component unmount
    return () => {
      if (printFrameRef.current && document.body.contains(printFrameRef.current)) {
        document.body.removeChild(printFrameRef.current);
      }
    };
  }, []);

  // Handle print functionality with browser's native print
  const handlePrint = () => {
    if (!printFrameRef.current) return;
    
    setIsPrinting(true);
    
    const iframe = printFrameRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Add print-specific styles
    const printStyles = `
      <style>
        @page {
          size: auto;
          margin: 10mm;
        }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          width: 100%;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-container {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(${columns}, minmax(0, 1fr));
          gap: 8px;
          margin: 0;
          padding: 8px;
          width: 100%;
          box-sizing: border-box;
        }
        .barcode-container {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
          text-align: center;
          page-break-inside: avoid;
          break-inside: avoid;
          margin: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: white;
          box-sizing: border-box;
        }
        .qr-container {
          padding: 8px;
          margin: 0;
        }
        svg.barcode {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
        }
        @media print {
          body {
            padding: 0;
            margin: 0;
            width: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-container {
            width: 100%;
            padding: 0;
            margin: 0 auto;
          }
          .grid {
            grid-template-columns: repeat(${columns}, minmax(0, 1fr));
            gap: 4px;
            padding: 4px;
            margin: 0;
            width: 100%;
          }
          .barcode-container {
            padding: 4px;
            border: 1px solid #ddd;
            margin: 0;
            max-width: 100%;
            overflow: hidden;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .page-break {
            page-break-after: always;
          }
          svg.barcode {
            max-width: 100%;
            height: auto !important;
            display: block !important;
          }
        }
      </style>
    `;
    
    // Create the printable content
    let printContent = `
      <html>
      <head>
        <title>${medicine.name} - Barcodes</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${printStyles}
      </head>
      <body>
        <div class="print-container">
          <div class="grid">
    `;
    
    // Generate the barcode content
    for (let i = 0; i < copies; i++) {
      printContent += `
        <div class="barcode-container">
      `;
      
      if (barcodeType === 'barcode') {
        // For barcode type, we'll use JsBarcode library
        printContent += `
          <div style="display: flex; flex-direction: column; align-items: center; margin: 0;" class="qr-container">
            <svg id="barcode-${i}" class="barcode" style="margin: 4px;"></svg>
            <div style="margin-top: 6px; font-size: ${sizeConfigs[size].fontSize}px; text-align: center; font-weight: 500;">
              ${medicine.barcode || `MED${medicine._id.slice(-4)}`}
            </div>
            <div style="margin-top: 2px; font-size: ${sizeConfigs[size].fontSize}px; text-align: center; font-weight: 500;">
              ${medicine.name}
            </div>
          </div>
        `;
      } else {
        // For QR code type, we'll use QRCode.js library
        printContent += `
          <div style="display: flex; flex-direction: column; align-items: center; margin: 0;" class="qr-container">
            <div id="qrcode-${i}" style="margin: 4px;"></div>
            <div style="margin-top: 6px; font-size: ${sizeConfigs[size].fontSize}px; text-align: center; font-weight: 500;">
              ${medicine.barcode || `MED${medicine._id.slice(-4)}`}
            </div>
            <div style="margin-top: 2px; font-size: ${sizeConfigs[size].fontSize}px; text-align: center; font-weight: 500;">
              ${medicine.name}
            </div>
          </div>
        `;
      }
      
      printContent += `
        </div>
      `;
    }
    
    printContent += `
          </div>
        </div>
      `;
    
    // Add necessary scripts
    if (barcodeType === 'barcode') {
      printContent += `
        <script src="https://unpkg.com/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function() {
            // Generate all barcodes
            for (let i = 0; i < ${copies}; i++) {
              JsBarcode("#barcode-" + i, "${medicine.barcode || `MED${medicine._id.slice(-4)}`}", {
                width: ${sizeConfigs[size].width},
                height: ${sizeConfigs[size].height},
                fontSize: ${sizeConfigs[size].fontSize},
                displayValue: false,
                margin: ${sizeConfigs[size].margin},
                format: "CODE128",
                background: "#ffffff",
                lineColor: "#000000"
              });
              
              // Force set SVG dimensions to ensure proper scaling
              const barcodeSvg = document.getElementById("barcode-" + i);
              if (barcodeSvg) {
                barcodeSvg.setAttribute("width", "100%");
                barcodeSvg.setAttribute("height", "${sizeConfigs[size].height}px");
                barcodeSvg.style.width = "100%";
                barcodeSvg.style.height = "${sizeConfigs[size].height}px";
                barcodeSvg.style.maxWidth = "100%";
                barcodeSvg.style.display = "block";
                barcodeSvg.style.margin = "0 auto";
                
                // Fix SVG viewBox to ensure perfect rendering
                if (!barcodeSvg.hasAttribute("viewBox") && 
                    barcodeSvg.hasAttribute("width") && 
                    barcodeSvg.hasAttribute("height")) {
                  const w = barcodeSvg.getAttribute("width").replace("px", "");
                  const h = barcodeSvg.getAttribute("height").replace("px", "");
                  barcodeSvg.setAttribute("viewBox", "0 0 " + w + " " + h);
                }
              }
            }
            
            // Notify parent window that generation is complete
            window.parent.postMessage('barcodeGenerationComplete', '*');
            
            // Print after a short delay to ensure everything is rendered
            setTimeout(function() {
              window.print();
              // Close the print dialog callback
              setTimeout(function() {
                window.parent.postMessage('printDialogClosed', '*');
              }, 2000);
            }, 1000);
          };
        </script>
      `;
    } else {
      printContent += `
        <script src="https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js"></script>
        <script>
          window.onload = function() {
            // Generate all QR codes
            for (let i = 0; i < ${copies}; i++) {
              new QRCode(document.getElementById("qrcode-" + i), {
                text: '${createMinimalQRData(medicine)}',
                width: ${sizeConfigs[size].qrSize},
                height: ${sizeConfigs[size].qrSize},
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
              });
              
              // Force set QR code wrapper dimensions
              const qrWrapper = document.getElementById("qrcode-" + i);
              if (qrWrapper) {
                qrWrapper.style.width = "${sizeConfigs[size].qrSize}px";
                qrWrapper.style.height = "${sizeConfigs[size].qrSize}px";
                qrWrapper.style.margin = "0 auto";
              }
            }
            
            // Notify parent window that generation is complete
            window.parent.postMessage('barcodeGenerationComplete', '*');
            
            // Print after a short delay to ensure everything is rendered
            setTimeout(function() {
              window.print();
              // Notify parent when print dialog is closed
              setTimeout(function() {
                window.parent.postMessage('printDialogClosed', '*');
              }, 2000);
            }, 700);
          };
        </script>
      `;
    }
    
    // Listen for messages from the iframe
    const messageHandler = (event) => {
      if (event.data === 'barcodeGenerationComplete') {
        // Barcodes/QR codes have been generated, but print dialog not yet shown
        console.log('Generation complete, print dialog opening soon...');
      } else if (event.data === 'printDialogClosed') {
        setIsPrinting(false);
        window.removeEventListener('message', messageHandler);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Write the content to the iframe
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();
    
    // Fallback in case the message events fail
    setTimeout(() => {
      setIsPrinting(false);
    }, 8000);
  };

  const handleScanComplete = (scannedMedicine) => {
    setShowScanner(false);
    console.log('Scanned medicine:', scannedMedicine);
  };

  // Create an array of copies to render in preview
  const previewArray = Array.from({ length: 1 }, (_, index) => index);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

      {/* Loading Overlay */}
      {isPrinting && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Preparing {copies} {barcodeType === 'barcode' ? 'barcodes' : 'QR codes'}...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we generate your print preview.</p>
        </div>
      )}

      {/* Modal */}
      <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 shadow-xl transform transition-all opacity-100 scale-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Print Barcode</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barcode Type</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setBarcodeType('barcode')}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md ${
                    barcodeType === 'barcode'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                  Barcode
                </button>
                <button
                  type="button"
                  onClick={() => setBarcodeType('qrcode')}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md ${
                    barcodeType === 'qrcode'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                  QR Code
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Copies
              </label>
              <input
                type="number"
                id="copies"
                min="1"
                  max="200"
                value={copies}
                  onChange={(e) => setCopies(Math.min(200, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="columns" className="block text-sm font-medium text-gray-700 mb-2">
                  Columns
                </label>
                <input
                  type="number"
                  id="columns"
                  min="1"
                  max="10"
                  value={columns}
                  onChange={(e) => setColumns(Math.min(10, Math.max(1, parseInt(e.target.value) || 5)))}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="border p-4 rounded-lg mb-6 bg-white overflow-auto">
            <h3 className="text-md font-medium text-gray-700 mb-4 text-center">Preview</h3>
            <div className="flex justify-center">
              <div className="inline-block p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex flex-col items-center">
                  {barcodeType === 'barcode' ? (
                    <Barcode
                      value={medicine.barcode || `MED${medicine._id.slice(-4)}`}
                      width={sizeConfigs[size].width}
                      height={sizeConfigs[size].height}
                      fontSize={sizeConfigs[size].fontSize}
                      margin={sizeConfigs[size].margin}
                      displayValue={false}
                    />
                  ) : (
                    <QRCodeSVG
                      value={createMinimalQRData(medicine)}
                      size={sizeConfigs[size].qrSize}
                      level="H"
                    />
                  )}
                  <p className="text-center mt-2 text-sm text-gray-600 font-medium">
                    {medicine.barcode || `MED${medicine._id.slice(-4)}`}
                  </p>
                  <p className="text-center text-sm text-gray-700 font-semibold mt-1">
                    {medicine.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50"
              disabled={isPrinting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isPrinting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPrinting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <PrinterIcon className="h-5 w-5 mr-2" />
                  Print {barcodeType === 'barcode' ? 'Barcodes' : 'QR Codes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onScanComplete={handleScanComplete}
        />
      )}
    </div>
  );
};

export default BarcodeGenerator; 