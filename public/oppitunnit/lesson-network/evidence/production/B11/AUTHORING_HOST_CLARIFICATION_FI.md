# B11: olemassa olevan moduulisopimuksen tarkennus

Tämä lisäohje kuvaa nykyistä toteutusta. AUTHORING.md säilytetään byte-identtisenä aiempien pakettien nimenomaisen ohje-/sopimussuojan vuoksi. Ei muutoksia loaderiin, semantiikkaan tai testeihin. Lopullinen ensimmäinen127-ajo havaitsi tämän dokumenttimuutoksen viidessä suojatestissä; epäonnistunut kuitti säilytetään.

### Konkreettinen host- ja tapahtumasopimus (B11:n tarkennus)

Loader antaa `mount(host)`-funktiolle `[data-lesson-module]`-ohjauskääreen. Se on artikkelin sisarus `#lesson-body`-alueella, ei oppitunnin oma sisältöjuuri. Etsi oma nimetty sisältöjuuri tämän alueen sisältä. Puuttuva juuri on näkyvä kytkentävirhe; hiljainen toimimaton instanssi ei ole onnistunut mount.

Omista instanssi sisältöjuuren mukaan ja disposeaa edellinen ennen uutta mountia. Uuden instanssin tulee asettaa omien kontrolliensa aloitustila; vanhan instanssin disposeen jäänyt disabled-tila ei saa lukita uutta. Säilytä myös aidosti tarkoituksella lukitut kontrollit oman tilakoneen mukaan. Poista kaikki omat kuuntelijat/ajastimet ja estä vanhan instanssin myöhemmät toiminnot.

Lue tarkistuksessa nykyiset näkyvät tehtävä-/mallivalinnat ja vastaukset uudelleen. Käsittele sekä input että change; eläkkeelle jäänyt palaute ei saa jäädä voimaan uutta premissiä varten. Tyhjä tai tuntematon valinta ei ole nolla eikä lupa korvata mallia oletuksella. Samanarvoisia vastausmuotoja käsitellään matemaattisen arvon perusteella tuetun, selvästi rajatun esitysmuodon sisällä. Pelkkä tekstin ylimääräinen etu-/loppunolla ei muuta arvoa.

