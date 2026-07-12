-- Migration : mise à jour de l'adresse de contact dans le modèle de message "Annonce générale"
-- lyceepagnidibsom@gmail.com -> infoslyceepagnidibsom@gmail.com (adresse d'affichage public)

update modeles_messages
set contenu = replace(contenu, 'lyceepagnidibsom@gmail.com', 'infoslyceepagnidibsom@gmail.com'),
    updated_at = now()
where contenu like '%lyceepagnidibsom@gmail.com%';
