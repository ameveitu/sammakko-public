# B05: version sidottu lisätarkistus

Alkuperäinen INTERACTION_FEEDBACK_CONTRACT.md säilyy tavuntarkkana, koska aiempien pakettien lähdemetatieto sitoutuu sen SHA-256-tiivisteeseen. Tämä erillinen liite kirjaa B05:n kohdennetun vastakokeen vanhaa sisältöä tai oppimispolitiikkaa jälkikäteen muuttamatta. Se ei väitä historiallisia kenttiä kokonaan uudelleen katselmoiduiksi.

## B05: muokkauksen tapahtuma ja näkyvä vastaus

Käsittele komponentin semanttisten kenttien `input`- ja `change`-tapahtumat johdonmukaisesti: sama näkyvä vastaus ei saa jäädä toiseen välimuistitilaan tapahtuman nimen perusteella. Vastakokeessa lähetetään kumpikin tapahtumatyyppi myös yksin. Nimenomainen tarkistus käyttää nykyistä näkyvää vastausta. Valinnainen apuviiva, toisto tai rivien totuuden säilyttävä järjestys ei tämän takia mitätöi toisen tehtävän palautetta. Tämä ei lisää ylimääräistä vahvistusklikkausta eikä yleistä lataajan kaikkiin tapahtumiin puuttuvaa kuuntelijaa.

Ohjelmallinen muutos käytöstä poistettuun kenttään tai kokonaan ilman tapahtumaa ei ole osoitettu tavallisen oppijakäytön virheeksi. Tällaisen vastakokeen raja kirjataan erikseen; sitä ei piiloteta eikä rinnasteta tapahtuneeseen oppilasvirheeseen. B05:n kohdennettu regressio ei väitä kaikkia historiallisia kenttiä tai avustavia teknologioita kokonaan auditoiduiksi.
