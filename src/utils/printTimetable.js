import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function printCalendarAsPDF(calendarSelector = ".fc") {
    console.log("Starting PDF generation...");
    
    const calendarEl = document.querySelector(calendarSelector);
    if (!calendarEl) {
        alert("Timetable not found!");
        return false;
    }

    const criticalSelectors = [
        '.fc-scroller',
        '.fc-timegrid-body',
        '.fc-daygrid-body', 
        '.fc-timegrid-slots',
        '.fc-timegrid-divider',
        '.fc-scrollgrid-sync-inner',
        '.fc-col-bg',
        '.fc-timegrid-col-bg',
    ];

    const elementsToModify = [];

    elementsToModify.push(calendarEl);
    
    criticalSelectors.forEach(selector => {
        const elements = calendarEl.querySelectorAll(selector);
        elements.forEach(el => elementsToModify.push(el));
    });

    const allDescendants = calendarEl.querySelectorAll('*');
    allDescendants.forEach(el => {
        const computed = getComputedStyle(el);
        if (computed.overflow !== 'visible' || 
            computed.overflowY !== 'visible' || 
            computed.maxHeight !== 'none' ||
            el.style.height) {
            if (!elementsToModify.includes(el)) {
                elementsToModify.push(el);
            }
        }
    });

    console.log(`Found ${elementsToModify.length} elements to modify`);

    const originalStyles = elementsToModify.map(el => ({
        el,
        height: el.style.height,
        minHeight: el.style.minHeight, 
        maxHeight: el.style.maxHeight,
        overflow: el.style.overflow,
        overflowX: el.style.overflowX,
        overflowY: el.style.overflowY,
        position: el.style.position,
        transform: el.style.transform,
    }));

    try {
        elementsToModify.forEach(el => {
            el.style.height = 'auto';
            el.style.minHeight = 'auto'; 
            el.style.maxHeight = 'none';
            el.style.overflow = 'visible';
            el.style.overflowX = 'visible';
            el.style.overflowY = 'visible';
        });

        const scrollers = calendarEl.querySelectorAll('.fc-scroller');
        scrollers.forEach(scroller => {
            if (scroller.scrollHeight > scroller.clientHeight) {
                scroller.style.height = scroller.scrollHeight + 'px';
            }
        });

        const timeGridBody = calendarEl.querySelector('.fc-timegrid-body');
        if (timeGridBody) {
            timeGridBody.style.height = 'auto';
            const timeSlots = timeGridBody.querySelector('.fc-timegrid-slots');
            if (timeSlots) {
                timeSlots.style.height = 'auto';
            }
        }

        const syncTables = calendarEl.querySelectorAll('.fc-scrollgrid-sync-table');
        syncTables.forEach(table => {
            table.style.height = 'auto';
        });

        calendarEl.style.height = 'auto';
        const randomVar = document.body.offsetHeight;
        await new Promise(resolve => setTimeout(resolve, 100));

        const randomVar2 = calendarEl.offsetHeight;
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log("Styles modified, capturing canvas...");
        console.log("Calendar dimensions:", {
            scrollWidth: calendarEl.scrollWidth,
            scrollHeight: calendarEl.scrollHeight,
            clientWidth: calendarEl.clientWidth,
            clientHeight: calendarEl.clientHeight
        });

        const canvas = await html2canvas(calendarEl, {
            backgroundColor: '#ffffff',
            scale: 1.5,
            useCORS: true,
            allowTaint: false,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            width: calendarEl.scrollWidth,
            height: calendarEl.scrollHeight,
            windowWidth: calendarEl.scrollWidth,
            windowHeight: calendarEl.scrollHeight,
            onclone: (clonedDoc) => {
                const clonedCalendar = clonedDoc.querySelector(calendarSelector);
                if (clonedCalendar) {
                    const clonedScrollers = clonedCalendar.querySelectorAll('.fc-scroller');
                    clonedScrollers.forEach(scroller => {
                        scroller.style.height = 'auto';
                        scroller.style.overflow = 'visible';
                    });
                }
            }
        });

        console.log("Canvas captured:", {
            width: canvas.width,
            height: canvas.height
        });

        const imgData = canvas.toDataURL('image/png', 0.95);

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const canvasAspectRatio = canvas.width / canvas.height;
        const pdfAspectRatio = pdfWidth / pdfHeight;
        
        let imgWidth, imgHeight;
        if (canvasAspectRatio > pdfAspectRatio) {
            imgWidth = pdfWidth;
            imgHeight = pdfWidth / canvasAspectRatio;
        } else {
            imgHeight = pdfHeight;
            imgWidth = pdfHeight * canvasAspectRatio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
        pdf.save(`Timetable_${timestamp}.pdf`);
        
        console.log("PDF generated successfully");
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF: ' + error.message);
        return false;
        
    } finally {
        console.log("Restoring original styles...");
        originalStyles.forEach(({el, height, minHeight, maxHeight, overflow, overflowX, overflowY, position, transform}) => {
            el.style.height = height || '';
            el.style.minHeight = minHeight || '';
            el.style.maxHeight = maxHeight || '';
            el.style.overflow = overflow || '';
            el.style.overflowX = overflowX || '';
            el.style.overflowY = overflowY || '';
            el.style.position = position || '';
            el.style.transform = transform || '';
        });
        
        const randomVar3 = document.body.offsetHeight;
        console.log("Styles restored");
    }
}

export async function printFullCalendarAsPDF(calendarRef) {
    if (!calendarRef?.current) {
        alert("Calendar reference not found!");
        return false;
    }

    const calendarApi = calendarRef.current.getApi();
    const calendarEl = calendarRef.current.elRef.current;
    
    if (!calendarEl) {
        alert("Calendar element not found!");
        return false;
    }

    console.log("Using FullCalendar API for PDF generation");

    calendarApi.updateSize();

    await new Promise(resolve => setTimeout(resolve, 100));
    
    return await printCalendarAsPDF('.fc');
}

export function debugCalendarStructure(calendarSelector = ".fc") {
    const calendarEl = document.querySelector(calendarSelector);
    if (!calendarEl) {
        console.log("Calendar not found");
        return;
    }
    
    console.log("Calendar structure:");
    console.log("Main calendar:", calendarEl.getBoundingClientRect());
    
    const scrollers = calendarEl.querySelectorAll('.fc-scroller');
    console.log(`Found ${scrollers.length} scrollers:`);
    scrollers.forEach((scroller, i) => {
        console.log(`Scroller ${i}:`, {
            rect: scroller.getBoundingClientRect(),
            scrollHeight: scroller.scrollHeight,
            clientHeight: scroller.clientHeight,
            styles: {
                height: scroller.style.height,
                overflow: getComputedStyle(scroller).overflow
            }
        });
    });
    
    const timeGrids = calendarEl.querySelectorAll('.fc-timegrid-body');
    console.log(`Found ${timeGrids.length} time grids:`);
    timeGrids.forEach((grid, i) => {
        console.log(`Time grid ${i}:`, grid.getBoundingClientRect());
    });
}