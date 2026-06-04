import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePDF(propertyData, results) {
    if (!results) {
        console.error('No results data for PDF');
        return;
    }
    
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(0, 102, 204);
    doc.text('Rent vs Sell Analysis Report', 20, 20);
    
    // Property Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const address = propertyData?.address || 'N/A';
    // Split long address to multiple lines if needed
    const splitAddress = doc.splitTextToSize(`Property: ${address}`, 170);
    doc.text(splitAddress, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Recommendation
    const isRent = results?.betterOption === 'rent';
    doc.setFontSize(16);
    doc.setTextColor(isRent ? 37 : 16, isRent ? 99 : 185, isRent ? 235 : 129);
    doc.text(`Recommendation: ${isRent ? 'RENT IT OUT' : 'SELL NOW'}`, 20, 80);
    
    // Format currency function
    const formatCurrency = (value) => {
        if (!value || isNaN(value)) return '$0';
        return `$${Math.round(value).toLocaleString()}`;
    };
    
    // Wealth comparison table
    autoTable(doc, {
        startY: 100,
        head: [['Strategy', 'Total Wealth']],
        body: [
            ['Rent & Sell Later', formatCurrency(results?.rentWealth)],
            ['Sell Now', formatCurrency(results?.sellWealth)],
            ['Difference', formatCurrency(results?.wealthDifference)]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204], textColor: 255 },
        styles: { fontSize: 12, cellPadding: 5 },
        margin: { left: 20, right: 20 }
    });
    
    // Get final Y position after table
    const finalY = doc.lastAutoTable.finalY + 20;
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('© RentalOrSale.com - Making informed real estate decisions', 20, finalY);
    doc.text(`Report generated on ${new Date().toLocaleString()}`, 20, finalY + 10);
    
    // Save PDF
    doc.save(`rent-vs-sell-${Date.now()}.pdf`);
}