Name: POC Veille Automatisee Estimate
overview: "POC en 5 jours pour une veille automatisee multi-sujets via n8n : workflow hebdomadaire pilote par une Google Sheet de configuration, collectant les actualites depuis Google News RSS + flux RSS par sujet, synthese par IA, livree par email HTML. Multi-sujets dynamique inclus nativement."
todos:
- id: jour1-config-collecte
	content: "Jour 1 : Creer la Google Sheet de config multi-sujets, construire le workflow de collecte dynamique (boucle par sujet, trigger, RSS, decodage URL, fusion, dedup, filtre date)"
	status: pending
- id: jour2-ia-prompts
	content: "Jour 2 : Integrer le noeud LLM, concevoir les prompts de categorisation + resume + synthese (iterations 1-3 sur donnees reelles du sujet retail)"
	status: pending
- id: jour3-prompts-email
	content: "Jour 3 : Finaliser la qualite des prompts (iterations 4-5), construire le template email HTML dynamique (nom du sujet injecte)"
	status: pending
- id: jour4-tests
	content: "Jour 4 : Tests de bout en bout sur le sujet retail, correction des problemes, ajout alerte d'echec, premiere simulation hebdo reelle"
	status: pending
- id: jour5-second-sujet
	content: "Jour 5 : Ajouter un 2e sujet dans la Google Sheet, tester la boucle multi-sujets, corriger, documentation legere, livraison"
	status: pending
isProject: false
## POC Veille Automatisee Multi-Sujets — Plan 5 Jours
### Perimetre
Un POC en 5 jours de veille automatisee multi-sujets via n8n. Le workflow s'execute chaque semaine, lit une Google Sheet de configuration definissant les sujets a surveiller (mots-cles, sources RSS, destinataires), boucle sur chaque sujet, collecte les actualites, utilise un LLM pour categoriser, resumer et synthetiser un rapport de veille, et envoie un email HTML par sujet. Ajouter un nouveau sujet = ajouter une ligne dans la Google Sheet.
Inclus dans le POC :
- Configuration multi-sujets dynamique via Google Sheet
- Workflow unique qui boucle sur tous les sujets configures
- Sujet "retail" comme premier sujet configure et teste
- Validation avec un 2e sujet (ex : "tech" ou "food retail") au Jour 5
Explicitement hors perimetre (reporte en Phase 2 si le POC est valide) :
- Sortie document (Google Doc / Notion / PDF) -- ajout ulterieur en ~1 jour
- Scoring de pertinence individuel par article -- le LLM filtre le bruit dans la synthese
- Logique de retry / degradation gracieuse -- seule une alerte d'echec est incluse
- Web scraping pour les sites sans RSS -- uniquement des sources RSS
Contrepartie par rapport au plan sans multi-sujets :
- Template email plus simple (fonctionnel et propre, mais moins travaille visuellement)
- 1 iteration de prompt en moins (4 au lieu de 5) -- qualite legerement moins polie
- Documentation plus legere (la Google Sheet sert de documentation vivante)
### Implementations de reference
- n8n template #8452 — Claude AI + monitoring Google News
- n8n template #5416 — Scraping multi-sources vers Markdown
- n8n template #3150 — Decodage URL Google News RSS (composant reutilisable)
- n8n template #8024 — Pattern RSS + resume Gemini
### Architecture
```
flowchart TD

    subgraph declencheur [Declencheur]

        Cron["Schedule Trigger (hebdomadaire)"]

    end



    subgraph config [Configuration]

        GSheet["Google Sheet Config"]

        Loop["Boucle sur chaque sujet"]

    end



    subgraph parSujet [Traitement par sujet]

        RSS["Noeuds RSS (URLs depuis config)"]

        GoogleNews["Google News RSS (mots-cles depuis config)"]

        Merge["Fusion et Dedup (par URL)"]

        Filter["Filtre date (7 derniers jours)"]

        Normalize["Normalisation des champs"]

        LLM["Noeud LLM (GPT-4o ou Claude)"]

        Output["Resumes categorises + synthese"]

        HTMLEmail["Rapport email HTML (nom sujet injecte)"]

        Email["Envoi aux destinataires du sujet"]

    end



    Cron --> GSheet

    GSheet --> Loop

    Loop --> RSS

    Loop --> GoogleNews

    RSS --> Merge

    GoogleNews --> Merge

    Merge --> Filter

    Filter --> Normalize

    Normalize --> LLM

    LLM --> Output

    Output --> HTMLEmail

    HTMLEmail --> Email

```
#### Structure de la Google Sheet de configuration
Chaque ligne = un sujet. Colonnes :
- Sujet : nom affiche dans l'email (ex : "Retail", "Tech", "Food Retail")
- Mots-cles Google News : requetes separees par des virgules (ex : retail France, grande distribution, e-commerce retail)
- URLs RSS : flux dedies separes par des virgules (ex :  [https://lsa.fr/rss](https://lsa.fr/rss "https://lsa.fr/rss"), [https://retaildetail.eu/fr/rss](https://retaildetail.eu/fr/rss` "https://retaildetail.eu/fr/rss%60"))
- Destinataires : emails separes par des virgules
- Actif : oui/non (permet de desactiver un sujet sans le supprimer)
### Planning jour par jour
#### Jour 1 : Google Sheet config + Workflow de collecte dynamique
Matin :
- Creer la Google Sheet de configuration avec la structure ci-dessus
- Remplir la premiere ligne avec le sujet "Retail" : mots-cles, 2-3 URLs RSS (LSA, Retail Detail, etc.), destinataires
- Selectionner et confirmer l'acces au fournisseur LLM (cle API prete)
- Configurer la connexion Google Sheets dans n8n (OAuth2)
Apres-midi :
- Construire le workflow n8n : Schedule Trigger -> Lire Google Sheet -> Filtrer lignes actives -> Boucle (Loop Over Items) sur chaque sujet
- Dans la boucle : noeuds RSS Read dynamiques (URLs depuis la config) + requetes HTTP Google News RSS (mots-cles depuis la config)
- Implementer le decodage des URL Google News (pattern du template #3150)
- Ajouter Merge, deduplication par URL, filtre de date (7 jours)
- Normaliser les champs : titre, URL, nom source, date publication, contenu brut
Livrable : Pipeline de collecte dynamique qui lit la config Google Sheet et produit une liste propre d'articles pour le sujet "Retail".
#### Jour 2 : Integration LLM + Prompt Engineering (Iterations 1-3)
Matin :
- Connecter le noeud LLM (OpenAI ou Claude via les noeuds IA natifs de n8n)
- Rediger le prompt initial avec le nom du sujet en variable : "Tu es un analyste specialise en {sujet}. A partir de ces articles, categorise chacun, fournis un resume en 2 phrases par article, et redige une synthese executive de 5 lignes sur les tendances cles de la semaine"
- Premier test avec les donnees retail reelles -> evaluation de la qualite
Apres-midi :
- Iteration prompt n°2 : corriger les problemes de categorisation, ameliorer la concision des resumes
- Iteration prompt n°3 : affiner la qualite de la synthese, s'assurer que le francais est naturel
- Gerer le batching : si le volume d'articles depasse les limites de tokens, decouper en lots et agreger
- Tester les cas limites : tres peu d'articles, beaucoup d'articles, articles hors sujet melanges
Livrable : Pipeline IA produisant une sortie JSON structuree (categories, resumes, synthese) avec le nom du sujet injecte dynamiquement. Qualite : "montrable", pas encore finalisee.
#### Jour 3 : Finalisation des prompts + Template email
Matin :
- Iteration prompt n°4 : ajustement final de la qualite base sur les sorties du Jour 2
- Valider que le filtrage du bruit fonctionne (articles non pertinents exclus de la synthese)
- Verrouiller le prompt
Apres-midi :
- Construire le template email HTML avec variables dynamiques :
	- En-tete avec {nom du sujet} et la periode couverte
	- Synthese executive
	- Articles groupes par categorie (titre, source, resume 2 lignes, lien)
	- Pied de page avec metadonnees de generation
- Configurer l'envoi d'email avec les destinataires lus depuis la config (Gmail OAuth2 ou SMTP)
- Envoyer un premier email de test pour le sujet "Retail"
Livrable : Premier rapport email complet recu en boite de reception, avec le nom du sujet injecte dynamiquement.
#### Jour 4 : Tests de bout en bout + Corrections
Journee complete :
- Executer le workflow complet 3 a 5 fois avec differentes fenetres de dates
- Corriger les problemes qui emergent (attendus : cas limites de parsing de dates, deviations occasionnelles du format LLM, problemes de rendu HTML)
- Ajouter une branche simple de gestion d'erreur : si un noeud echoue, envoyer un email d'alerte a l'administrateur
- Valider que le declenchement cron hebdomadaire fonctionne correctement
- Tester avec un scenario simule "aucun article trouve"
- Verification de performance : s'assurer que l'execution complete prend moins de 5 minutes par sujet
Livrable : Workflow stable et teste pour le sujet "Retail". Problemes connus documentes.
#### Jour 5 : Validation multi-sujets + Livraison
Matin :
- Ajouter un 2e sujet dans la Google Sheet (ex : "Tech" ou "Food Retail") avec ses propres mots-cles, sources RSS et destinataires
- Executer le workflow complet : verifier que la boucle traite les 2 sujets et envoie 2 emails distincts
- Corriger les eventuels problemes lies a la boucle multi-sujets (isolation des donnees entre sujets, gestion des erreurs par sujet)
Apres-midi :
- Nettoyer le workflow : nommage clair des noeuds, disposition logique, suppression des noeuds de debug
- Rediger une documentation legere :
	- Comment ajouter un nouveau sujet (= ajouter une ligne dans la Google Sheet)
	- Liste des cles API / credentials necessaires
	- Limitations connues
- Execution de demo finale avec les 2 sujets pour la livraison
Livrable : POC complet, multi-sujets fonctionnel, teste avec 2 sujets, pret a etre livre. Ajouter un sujet = ajouter une ligne.
### Ce que ce POC en 5 jours delivre
- Veille hebdomadaire entierement automatisee, multi-sujets
- Configuration dynamique via Google Sheet (ajouter un sujet = ajouter une ligne)
- Categorisation, resume et synthese executive par IA, parametree par sujet
- Rapport email HTML professionnel par sujet, envoye aux destinataires configures
- Teste et valide avec 2 sujets (retail + un second)
### Ce qui peut etre ajoute ensuite (Phase 2, si le POC est valide)
- Sortie document (Google Doc / Notion) : ~1 jour
- Pipeline IA multi-etapes (scoring separe, categorisation approfondie) : ~1 jour
- Gestion d'erreurs robuste (retries, sources de fallback) : ~0.5 jour
- Canaux de livraison supplementaires (Slack, Teams) : ~0.5 jour chacun
- Raffinement visuel du template email : ~0.5 jour
### Facteurs de risque
- Le prompt engineering peut deborder sur le Jour 4 matin : Si la qualite de sortie n'est pas suffisante en fin de Jour 3, les tests sont compresses. Mitigation : accepter une qualite "suffisante" pour le POC, noter le raffinement en Phase 2.
- La boucle multi-sujets peut creer des bugs d'isolation : Les donnees d'un sujet peuvent "fuiter" dans un autre si le noeud Loop n'est pas correctement configure. Mitigation : tester specifiquement ce point au Jour 5.
- Instabilite du RSS Google News : Google modifie occasionnellement le comportement RSS. Mitigation : avoir 2-3 flux RSS dedies comme sources de secours.
- Limites de tokens avec un volume d'articles eleve : Si un sujet genere 100+ articles/semaine, la logique de batching se complexifie. Mitigation : plafonner aux 30-50 articles les plus recents par sujet.
### Couts recurrents
- API LLM : ~0.50-2.00 EUR par sujet par execution hebdomadaire
- n8n : deja disponible (pas de cout supplementaire)
- Google Sheets : gratuit
- Aucune API payante requise (Google News RSS est gratuit, les flux RSS standards sont gratuits)
