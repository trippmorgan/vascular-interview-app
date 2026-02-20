document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('procedure-modal');
    const modalTitle = document.getElementById('modal-artery-name');
    const form = document.getElementById('procedure-data-form');
    const hiddenArteryInput = document.getElementById('artery-name');
    const closeButton = document.querySelector('.close-button');

    // Open modal when a clickable area is clicked
    document.querySelectorAll('area').forEach(area => {
        area.addEventListener('click', (event) => {
            event.preventDefault();
            const arteryName = area.getAttribute('data-artery');
            
            modalTitle.textContent = `Log for: ${arteryName}`;
            hiddenArteryInput.value = arteryName;
            
            modal.style.display = 'block';
        });
    });

    // Close modal via the 'X' button
    closeButton.onclick = () => {
        modal.style.display = 'none';
        form.reset();
    };

    // Close modal by clicking outside of it
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            form.reset();
        }
    };

    // Handle form submission
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const treatments = Array.from(form.querySelectorAll('input[name="treatment"]:checked'))
                                .map(cb => cb.value);

        const data = {
            artery: form.artery.value,
            occlusionLength: form.occlusionLength.value,
            treatments: treatments
        };

        // Send data to the server
        fetch('/log-procedure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Server response:', result);
            alert(`Procedure for ${data.artery} logged successfully!`);
            modal.style.display = 'none';
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to log procedure.');
        });
    });
});