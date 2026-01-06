/**
 * Conjugation Utility
 * Handles regular -er, -ir, -re verbs and key irregulars.
 */

const ENDINGS = {
    er: {
        present: ['e', 'es', 'e', 'ons', 'ez', 'ent'],
        imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
        futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
        conditionnel: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
        subjonctif: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
        passe_compose: 'é'
    },
    ir: {
        present: ['is', 'is', 'it', 'issons', 'issez', 'issent'],
        imparfait: ['issais', 'issais', 'issait', 'issions', 'issiez', 'issaient'],
        futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
        conditionnel: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
        subjonctif: ['isse', 'isses', 'isse', 'issions', 'issiez', 'issent'],
        passe_compose: 'i'
    },
    re: {
        present: ['s', 's', '', 'ons', 'ez', 'ent'],
        imparfait: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
        futur: ['ai', 'as', 'a', 'ons', 'ez', 'ont'],
        conditionnel: ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'],
        subjonctif: ['e', 'es', 'e', 'ions', 'iez', 'ent'],
        passe_compose: 'u'
    }
};

const SUBJECTS = ['Je', 'Tu', 'Il / Elle / On', 'Nous', 'Vous', 'Ils / Elles'];
const AUXILIARY = {
    avoir: { present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'] },
    etre: { present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'] }
};

const IRREGULARS = {
    avoir: {
        present: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
        imparfait: ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
        futur: ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
        conditionnel: ['aurais', 'aurais', 'aurait', 'aurions', 'auriez', 'auraient'],
        subjonctif: ['aie', 'aies', 'ait', 'ayons', 'ayez', 'aient'],
        passe_compose: ['eu', 'eu', 'eu', 'eu', 'eu', 'eu'],
        aux: 'avoir'
    },
    etre: {
        present: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
        imparfait: ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
        futur: ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
        conditionnel: ['serais', 'serais', 'serait', 'serions', 'seriez', 'seraient'],
        subjonctif: ['sois', 'sois', 'soit', 'soyons', 'soyez', 'soient'],
        passe_compose: ['été', 'été', 'été', 'été', 'été', 'été'],
        aux: 'avoir'
    },
    aller: {
        present: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
        imparfait: ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
        futur: ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
        conditionnel: ['irais', 'irais', 'irait', 'irions', 'iriez', 'iraient'],
        subjonctif: ['aille', 'ailles', 'aille', 'allions', 'alliez', 'aillent'],
        passe_compose: ['allé', 'allé', 'allé', 'allé', 'allé', 'allé'],
        aux: 'etre'
    },
    faire: {
        present: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
        imparfait: ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
        futur: ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
        conditionnel: ['ferais', 'ferais', 'ferait', 'ferions', 'feriez', 'feraient'],
        subjonctif: ['fasse', 'fasses', 'fasse', 'fassions', 'fassiez', 'fassent'],
        passe_compose: ['fait', 'fait', 'fait', 'fait', 'fait', 'fait'],
        aux: 'avoir'
    }
};

class Conjugator {
    constructor() {
        this.vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'h']; // h muet approximation
    }

    getSubject(index, verbForm) {
        let subj = SUBJECTS[index];
        if (index === 0 && this.vowels.includes(verbForm.charAt(0).toLowerCase())) {
            return "J'";
        }
        return subj;
    }

    conjugate(verb, tense) {
        verb = verb.toLowerCase().trim();

        // Normalize for lookup (handle être vs etre)
        const lookupKey = verb.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Check Irregulars
        if (IRREGULARS[lookupKey]) {
            return this.processIrregular(lookupKey, tense);
        }

        // Regular Logic
        let type = '';
        if (verb.endsWith('er')) type = 'er';
        else if (verb.endsWith('ir')) type = 'ir';
        else if (verb.endsWith('re')) type = 're';
        else return null; // Unknown

        return this.processRegular(verb, type, tense);
    }

    processIrregular(verb, tense) {
        const data = IRREGULARS[verb];
        const forms = data[tense];

        if (tense === 'passe_compose') {
            // Logic for PC
            const auxVerb = data.aux;
            const pp = forms[0];
            const auxForms = AUXILIARY[auxVerb].present;

            return auxForms.map((aux, i) => {
                return {
                    pronoun: this.getSubject(i, aux),
                    base: aux + " ",
                    ending: pp,
                    full: `${aux} ${pp}`
                };
            });
        }

        if (!forms) return null; // Tense not supported yet

        return forms.map((form, i) => {
            return {
                pronoun: this.getSubject(i, form),
                base: form,
                ending: '',
                full: form
            };
        });
    }

    processRegular(verb, type, tense) {
        const stem = verb.substring(0, verb.length - 2); // default stem
        const map = ENDINGS[type];

        if (tense === 'passe_compose') {
            const aux = 'avoir';
            const pp = stem + map.passe_compose;
            const auxForms = AUXILIARY[aux].present;

            return auxForms.map((auxVal, i) => {
                return {
                    pronoun: this.getSubject(i, auxVal),
                    base: auxVal + " ",
                    ending: pp,
                    full: `${auxVal} ${pp}`
                };
            });
        }

        let endings = map[tense];
        let modifiedStem = stem;

        if (tense === 'futur' || tense === 'conditionnel') {
            if (type === 're') {
                modifiedStem = verb.substring(0, verb.length - 1);
            } else {
                modifiedStem = verb;
            }
        }

        return endings.map((end, i) => {
            // For Subjunctive, often need "que" before. But chart usually just shows verb? 
            // User didn't request "que". Just the form.
            return {
                pronoun: this.getSubject(i, modifiedStem),
                base: modifiedStem,
                ending: end,
                full: modifiedStem + end
            };
        });
    }
}

window.Conjugator = new Conjugator();
