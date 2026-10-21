# Warszawska Kwiaciarnia – strona-wizytówka (prototyp)

Jednostronicowa strona dla kwiaciarni na Bemowie (Powstańców Śląskich 24A, naprzeciwko Hali Wola).
Czysty HTML, CSS i odrobina JS. Bez builda, bez zależności, bez backendu. Działa z pliku, z GitHub Pages i z dowolnego hostingu statycznego.

## Trzy wersje kolorystyczne do porównania

Prototyp ma przełącznik motywów (kółka w nagłówku na komputerze, w prawym dolnym rogu na telefonie).
Każdą wersję można też otworzyć bezpośrednio z linku:

| Wersja | Link |
|---|---|
| Pudrowy róż (domyślna) | `…/?theme=pastel` |
| Zielnik | `…/?theme=botanical` |
| Nocny ogród | `…/?theme=premium` |

Dodatek `&review=1` pokazuje w rogu etykietę z nazwą aktualnej wersji (przydatne przy omawianiu).

## Jak uruchomić lokalnie

Wystarczy otworzyć `index.html` w przeglądarce. Jeśli wolisz serwer:

```bash
python -m http.server 8321
```

i wejść na <http://localhost:8321>.

## Struktura

```
index.html            cała treść strony (sekcje oznaczone komentarzami)
assets/css/styles.css style; motywy = trzy bloki zmiennych na górze pliku
assets/js/main.js     przełącznik motywów, „otwarte teraz”, lightbox, mapa po kliknięciu
assets/img/           zdjęcia (WebP) ze starej strony i Instagrama kwiaciarni, logo, favicon, og.jpg
```

Treść zmienia się bezpośrednio w `index.html`. Godziny otwarcia są w dwóch miejscach: w atrybucie `data-hours`
na plakietce w nagłówku (format `{"1":[9,20], …, "0":[10,16]}`, 0 = niedziela) oraz w tabeli w sekcji „Odwiedź nas”
i w stopce. Przy zmianie godzin trzeba poprawić wszystkie trzy.

## Co jest w środku

Nagłówek z telefonem i plakietką „Dziś otwarte do 20:00” → hero → „Jak zamówić” → oferta z cenami orientacyjnymi →
galeria z lightboxem → śluby i eventy / dla firm → o nas → opinie → kontakt z tabelą godzin i mapą → FAQ → stopka.
Na telefonie stały dolny pasek: Zadzwoń · Instagram · Dojazd.

## Do potwierdzenia z właścicielką (zanim strona pójdzie „na prawdę”)

1. Godziny otwarcia (na starej stronie było „codziennie 9–21”, na Instagramie pn–pt 9–20, sb 10–20, nd 10–16) i wyjątki świąteczne.
2. Ceny: „od 100 zł”, flower boxy 120–140 zł, premium 300–400 zł – czy aktualne. Cena roślin doniczkowych.
3. Ocena „4,9” i „ponad 100 opinii” – sprawdzić w wizytówce Google w dniu pokazu; link do opinii.
4. Dowóz: zasięg, koszt, do której godziny można zamówić na dziś. Płatność kartą/BLIK, faktura dla firm.
5. Zgoda na użycie zdjęć ze starej strony i Instagrama; czy są oryginały w lepszej jakości; zdjęcie florystki lub wnętrza.
6. Logo: czy ma lotos w wektorze; czy chce je zachować.
7. Opinie: zgoda na cytowanie trzech opinii z Google z imionami.
8. Śluby: ile wyprzedzenia; czy robi dekoracje plenerowe. Firmy: co dokładnie i dla kogo.
9. Domena kwiaciarniawarszawska.pl: kto ma dostęp do DNS i hostingu home.pl; czy przekierować na nową stronę.
10. Który motyw (albo mieszanka) i co zmienić w tekstach.

## Przed wdrożeniem produkcyjnym

- [ ] Usunąć `<meta name="robots" content="noindex">` z `index.html`.
- [ ] Usunąć przełącznik motywów (`.theme-switch` w HTML, blok 1 w `main.js`, skrypt w `<head>`), zostawić jeden `data-theme` na `<html>`.
- [ ] Zostawić w linku Google Fonts tylko dwie rodziny wybranego motywu.
- [ ] Ustawić absolutny adres w `og:image` (po ustaleniu domeny).
- [ ] Wkleić aktualne opinie i liczby z Google.
- [ ] Jeśli strona ma iść pod własną domenę: plik `CNAME` w repo i rekordy DNS u operatora domeny.

## GitHub Pages

Repozytorium publiczne, gałąź `main`, katalog główny. Wszystkie ścieżki są względne, więc strona działa pod
`https://<użytkownik>.github.io/<repo>/` bez żadnych zmian.
