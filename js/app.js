/**
 * Main Application Logic
 */

const App = {
    state: {
        lastVerb: 'parler',
        lastTense: 'present',
        personalList: JSON.parse(localStorage.getItem('frenchApp_list')) || [],
        practice: {
            currentPronounIndex: 0,
            streak: 0
        }
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderDaisyWheel();
        this.updateExplorer(); // Initial render
        this.renderList();
    },

    cacheDOM() {
        this.dom = {
            pages: document.querySelectorAll('.page'),
            navBtns: document.querySelectorAll('.nav-btn'),

            // Explorer
            verbInput: document.getElementById('verb-input'),
            tenseSelect: document.getElementById('tense-select'),
            daisyContainer: document.getElementById('daisy-wheel-container'),
            resultPronoun: document.getElementById('result-pronoun'),
            resultVerb: document.getElementById('result-verb'),
            resultExplanation: document.getElementById('result-explanation'),

            // Practice
            practiceCurrentVerb: document.getElementById('practice-current-verb'),
            practiceTenseSelect: document.getElementById('practice-tense-select'),
            practicePronoun: document.getElementById('practice-pronoun'),
            practiceInput: document.getElementById('practice-input'),
            practiceFeedback: document.getElementById('practice-feedback'),
            btnAddList: document.getElementById('btn-add-list'),

            // List
            listTenseSelect: document.getElementById('list-tense-select'),
            myVerbList: document.getElementById('my-verb-list')
        };
    },

    bindEvents() {
        // Navigation
        window.navigateTo = (pageId) => this.navigateTo(pageId);

        // Explorer Inputs
        this.dom.verbInput.addEventListener('input', (e) => {
            this.state.lastVerb = e.target.value;
            this.updateExplorer();
        });
        this.dom.tenseSelect.addEventListener('change', (e) => {
            this.state.lastTense = e.target.value;
            this.updateExplorer();
        });

        // Practice Inputs
        this.dom.practiceCurrentVerb.addEventListener('change', (e) => {
            this.state.lastVerb = e.target.value;
            this.nextPracticeRound(); // Restart round with new verb
        });
        this.dom.practiceTenseSelect.addEventListener('change', (e) => {
            this.state.lastTense = e.target.value; // Keep generic state or separate practice state?
            // Let's use generic for now to keep simple sync
            this.nextPracticeRound();
        });

        this.dom.practiceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        this.dom.btnAddList.addEventListener('click', () => {
            this.addToPersonalList(this.state.lastVerb);
        });

        // List Inputs
        this.dom.listTenseSelect.addEventListener('change', () => this.renderList());
    },

    navigateTo(pageId) {
        // Handle transitions between pages
        this.dom.pages.forEach(p => {
            p.classList.remove('active');
            if (p.id === `page-${pageId}`) {
                p.classList.add('active');
            }
        });

        if (pageId === 'practice') {
            this.startPractice();
        } else if (pageId === 'list') {
            this.renderList();
        }
    },

    // ==========================================
    // PAGE 1: EXPLORER
    // ==========================================

    renderDaisyWheel() {
        const subjects = ['Je', 'Tu', 'Il/Elle', 'Nous', 'Vous', 'Ils/Elles'];
        // 12 o'clock start (-90deg), clockwise
        // Je=Noon (0/-90), Tu=2:00 (60deg), etc.
        const radius = 65; // Percentage or px. Let's use % to be responsive? No, px relative to container center
        const container = this.dom.daisyContainer;
        const centerX = 50; // %
        const centerY = 50; // %

        subjects.forEach((subj, i) => {
            const angleDeg = i * 60 - 90; // 0 is exactly 3 o'clock in trig usually, but noon is -90 from there? 
            // Noon = -90deg (CSS rotate). 
            // Actually: Noon (0), 2 (60), 4 (120), 6 (180), 8 (240), 10 (300)

            const petal = document.createElement('div');
            petal.className = 'daisy-petal';
            petal.textContent = subj;

            // Layout Logic (Circular)
            // We can use transform rotate on a container, or sin/cos.
            // Let's use absolute with transform.
            // Radius approx 120px for desktop, smaller for mobile.
            // Let's use CSS variables or Calc.

            petal.style.position = 'absolute';
            petal.style.left = '50%';
            petal.style.top = '50%';
            petal.style.marginLeft = '-30px'; // Centering offset (half width)
            petal.style.marginTop = '-30px';  // Centering offset (half height)
            petal.style.transform = `rotate(${i * 60}deg) translate(0, -85px) rotate(-${i * 60}deg)`;
            // translate(0, -85px) moves it "Up" (Noon) relative to center if unrotated.
            // Reduced radius from 110px to 85px to tighten the circle.
            // Rotating parent then counter-rotating child keeps text upright.

            // Styling
            petal.style.width = '60px';
            petal.style.height = '60px';
            petal.style.background = 'white';
            petal.style.color = '#333';
            petal.style.borderRadius = '50%';
            petal.style.display = 'flex';
            petal.style.alignItems = 'center';
            petal.style.justifyContent = 'center';
            petal.style.fontSize = '0.8rem';
            petal.style.fontWeight = 'bold';
            petal.style.cursor = 'pointer';
            petal.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
            petal.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            petal.style.userSelect = 'none';

            petal.addEventListener('click', () => {
                this.showConjugation(i);
                // Visual feedback
                document.querySelectorAll('.daisy-petal').forEach(p => {
                    p.style.background = 'white';
                    p.style.color = '#333';
                    p.style.transform = p.style.transform.replace('scale(1.1)', 'scale(1)');
                });
                petal.style.background = '#2ed573';
                petal.style.color = 'white';
                petal.style.transform += ' scale(1.1)';
            });

            container.appendChild(petal);
        });

        // Add Red Center
        const center = document.createElement('div');
        center.style.position = 'absolute';
        center.style.left = '50%';
        center.style.top = '50%';
        center.style.transform = 'translate(-50%, -50%)';
        center.style.width = '40px';
        center.style.height = '40px';
        center.style.background = '#ff4757';
        center.style.borderRadius = '50%';
        center.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        container.appendChild(center);
    },

    updateExplorer() {
        const verb = this.state.lastVerb;
        const tense = this.state.lastTense;
        // Don't auto-show conjugation until clicked? Or show default (Je)?
        // Let's reset view
    },

    showConjugation(pronounIndex) {
        const verb = this.state.lastVerb;
        const tense = this.state.lastTense;
        const result = window.Conjugator.conjugate(verb, tense);

        if (!result) {
            this.dom.resultVerb.textContent = "Unknown Verb";
            this.dom.resultExplanation.textContent = "Try a regular -er, -ir, -re verb or avoir/etre/aller/faire.";
            return;
        }

        const data = result[pronounIndex];

        // Render
        this.dom.resultPronoun.textContent = data.pronoun;

        // Color coding: Base (White) + Ending (Red? Or Accent?)
        // User requested: "verb ending and the pronoun should be displayed using the same color"
        // Let's say Pronoun is Accent Color. Ending is Accent Color. Stem is White.

        // Wait, "Daisy petals are spaced... Je=noon... color connection."
        // Let's make Pronoun Text Color match Ending Text Color.
        const accentColor = '#2ed573'; // Green for success/matching? Or the daisy petal color.

        this.dom.resultPronoun.style.color = accentColor;

        // Construct HTML for verb
        this.dom.resultVerb.innerHTML = `
            <span>${data.base}</span><span style="color: ${accentColor}">${data.ending}</span>
        `;

        this.dom.resultExplanation.textContent = this.getExplanation(tense, pronounIndex);
    },

    getExplanation(tense, index) {
        // Placeholder explanations
        const explanations = {
            present: "Used for actions happening right now.",
            imparfait: "Used for ongoing past actions or descriptions.",
            futur: "Used for actions that will happen.",
            passe_compose: "Used for completed past actions.",
            conditionnel: "Used for 'would' situations."
        };
        return explanations[tense] || "";
    },

    // ==========================================
    // PAGE 2: PRACTICE
    // ==========================================

    startPractice() {
        this.dom.practiceCurrentVerb.value = this.state.lastVerb;
        // Mirror tense
        // Pick random pronoun
        this.nextPracticeRound();
        this.dom.practiceFeedback.textContent = "";
        this.dom.practiceInput.value = "";
    },

    nextPracticeRound() {
        this.state.practice.currentPronounIndex = Math.floor(Math.random() * 6);
        const subjects = ['Je', 'Tu', 'Il / Elle / On', 'Nous', 'Vous', 'Ils / Elles'];
        this.dom.practicePronoun.textContent = subjects[this.state.practice.currentPronounIndex];
        this.dom.practiceInput.value = "";
        this.dom.practiceInput.focus();
    },

    checkAnswer() {
        const verb = this.state.lastVerb;
        const tense = this.state.lastTense; // Or use the one on practice page
        const input = this.dom.practiceInput.value.trim().toLowerCase();
        const index = this.state.practice.currentPronounIndex;

        const result = window.Conjugator.conjugate(verb, tense);
        if (!result) return;

        const expected = result[index].full.toLowerCase();

        // Simple check: does input end with the expected ending? 
        // Or full match? "enter the verb form". Usually implies full word.
        // Careful with "J'ai" vs "ai". Prompt shows "Je". User should type "ai"? Or "J'ai"?
        // "window in center will show subject pronoun... enter verb form".
        // If prompt is "Je", answer is "parle".
        // If prompt is "J'", answer is "ai". 
        // Let's expect the full verb word(s), sans pronoun.

        // Adjust expectation logic
        let target = expected;
        // If Expected is "J'ai", splitting is weird. Conjugator returns "J'ai" or just "ai"?
        // My conjugator returns full "J'ai" or "Je parle".
        // I need just the verb part.

        // Hacky fix: Split by space, take last part? No (Passe Compose is 2 words).
        // Let's rely on conjugator structure { base, ending }
        // result[i].full is "Je parle". 
        // We want "parle".

        const pronounPart = result[index].pronoun;
        // Remove pronoun from full
        // Careful with elision J'
        let answerOnly = result[index].full.replace(pronounPart, '').trim();

        // Edge case: J'ai -> Pronoun J'. Full J'ai. Replace J' -> ai. Correct.
        // Edge case: Je parle -> Pronoun Je. Full Je parle. Replace Je -> parle. Correct.

        if (input === answerOnly) {
            this.dom.practiceFeedback.textContent = "Très bien!";
            this.dom.practiceFeedback.style.color = "#2ed573";

            // Wait then next
            setTimeout(() => {
                this.dom.practiceFeedback.textContent = "";
                this.nextPracticeRound();
            }, 1000);
        } else {
            this.dom.practiceFeedback.textContent = "Pas encore.";
            this.dom.practiceFeedback.style.color = "#ff4757";
        }
    },

    // ==========================================
    // PAGE 3: LIST
    // ==========================================

    addToPersonalList(verb) {
        if (!this.state.personalList.includes(verb)) {
            this.state.personalList.push(verb);
            localStorage.setItem('frenchApp_list', JSON.stringify(this.state.personalList));
            alert(`Added ${verb} to your list!`);
        } else {
            alert(`${verb} is already in your list.`);
        }
    },

    renderList() {
        const list = this.state.personalList;
        const container = this.dom.myVerbList;
        const tense = this.dom.listTenseSelect.value;

        container.innerHTML = "";

        if (list.length === 0) {
            container.innerHTML = '<div style="text-align: center; opacity: 0.5; margin-top: 50px;">No verbs added yet.</div>';
            return;
        }

        list.forEach(verb => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.style.background = 'rgba(255,255,255,0.05)';
            item.style.borderRadius = '12px';
            item.style.marginBottom = '10px';
            item.style.overflow = 'hidden';

            const header = document.createElement('div');
            header.style.padding = '15px';
            header.style.cursor = 'pointer';
            header.style.fontWeight = 'bold';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.textContent = verb;

            const detail = document.createElement('div');
            detail.style.display = 'none';
            detail.style.padding = '15px';
            detail.style.background = 'rgba(0,0,0,0.2)';
            detail.style.fontSize = '0.9em';

            // Conjugate for chart
            const conj = window.Conjugator.conjugate(verb, tense);
            if (conj) {
                const singular = conj.slice(0, 3);
                const plural = conj.slice(3, 6);

                detail.innerHTML = `
                    <div style="display: flex; gap: 20px;">
                        <div style="flex: 1;">
                            <div style="font-size: 0.8em; opacity: 0.5; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.1);">Singular</div>
                            ${singular.map(c => `<div><span style="opacity:0.7">${c.pronoun}</span> <b>${c.full.replace(c.pronoun, '').trim()}</b></div>`).join('')}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-size: 0.8em; opacity: 0.5; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.1);">Plural</div>
                            ${plural.map(c => `<div><span style="opacity:0.7">${c.pronoun}</span> <b>${c.full.replace(c.pronoun, '').trim()}</b></div>`).join('')}
                        </div>
                    </div>
                `;
            } else {
                detail.textContent = "Conjugation unavailable.";
            }

            header.addEventListener('click', () => {
                const isOpen = detail.style.display === 'block';
                detail.style.display = isOpen ? 'none' : 'block';
            });

            item.appendChild(header);
            item.appendChild(detail);
            container.appendChild(item);
        });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
