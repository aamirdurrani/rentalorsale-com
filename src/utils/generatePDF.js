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
    doc.text(`Property: ${propertyData?.address || 'N/A'}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Recommendation
    const isRent = results?.betterOption === 'rent';
    doc.setFontSize(16);
    doc.setTextColor(isRent ? 37 : 16, isRent ? 99 : 185, isRent ? 235 : 129);
    doc.text(`Recommendation: ${isRent ? 'RENT IT OUT' : 'SELL NOW'}`, 20, 80);
    
    // Wealth comparison table
    autoTable(doc, {
        startY: 100,
        head: [['Strategy', 'Total Wealth']],
        body: [
            ['🏠 Rent & Sell Later', `$${Math.round(results?.rentWealth || 0).toLocaleString()}`],
            ['💰 Sell Now', `$${Math.round(results?.sellWealth || 0).toLocaleString()}`],
            ['Difference', `$${Math.round(results?.wealthDifference || 0).toLocaleString()}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204], textColor: 255 }
    });
    
    // Save PDF
    doc.save(`rent-vs-sell-${Date.now()}.pdf`);
}