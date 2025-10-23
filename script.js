// ************************************************************
// KONFIGURACE
// Zde vlož URL adresu z Google Apps Script, kam se data posílají
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxd7YHVtS_FMX1Xe6wNfJx8DcH9UorXcgexUe05pRIflQvXUQ3x0PLHMAgDCTDfndONKw/exec';
// ************************************************************

/**
 * Hlavní funkce, která se spustí, jakmile se načte celý dokument (DOM).
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tradingForm');
    const submitButton = document.getElementById('submitButton');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // Posluchač události pro odeslání formuláře
    form.addEventListener('submit', async (e) => {
        // 1. Zastavení výchozího chování formuláře (nechceme, aby se stránka načítala znovu)
        e.preventDefault(); 

        // 2. Příprava uživatelského rozhraní
        submitButton.disabled = true; // Zablokování tlačítka
        submitButton.textContent = 'Odesílám... ⏳';
        feedbackMessage.textContent = 'Odesílání dat do deníku...';
        feedbackMessage.style.backgroundColor = '#fff3cd'; // Žluté pozadí pro pending

        // 3. Sběr dat z formuláře
        // Vytvoříme objekt FormData, který automaticky shromáždí data
        // na základě atributů 'name' v HTML prvcích.
        const formData = new FormData(form);

        try {
            // 4. Odeslání dat pomocí Fetch API
            const response = await fetch(GOOGLE_SHEETS_ENDPOINT, {
                method: 'POST',
                body: formData // FormData se automaticky naformátuje pro odeslání
            });
            
            // 5. Kontrola odpovědi
            if (response.ok) {
                // Přijetí JSON odpovědi ze skriptu Apps Script (GAS)
                const result = await response.json(); 

                if (result.result === 'success') {
                    // Úspěch
                    feedbackMessage.textContent = `✅ Záznam úspěšně uložen do deníku (řádek ${result.row}).`;
                    feedbackMessage.style.backgroundColor = '#d4edda'; // Zelené pozadí
                    form.reset(); // Vyčištění formuláře po úspěšném odeslání
                } else {
                    // Selhání z pohledu GAS skriptu (teoreticky by se nemělo stát)
                    throw new Error('Chyba při zápisu dat v Apps Scriptu.');
                }

            } else {
                // HTTP chybový kód (např. 404, 500)
                throw new Error(`Chyba serveru: ${response.status} ${response.statusText}`);
            }

        } catch (error) {
            // 6. Zpracování chyby (selhalo síťové připojení, problém s GAS atd.)
            console.error('Došlo k chybě při odesílání:', error);
            feedbackMessage.textContent = `❌ Chyba při ukládání: ${error.message}. Zkontrolujte připojení a URL.`;
            feedbackMessage.style.backgroundColor = '#f8d7da'; // Červené pozadí

        } finally {
            // 7. Vrácení UI do původního stavu
            submitButton.disabled = false;
            submitButton.textContent = 'Uložit Záznam do Deníku';
        }
    });
});