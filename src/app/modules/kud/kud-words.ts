// The full randomizer pool for the "Vleesdoos" generator (internal module/route/AppKey
// name stays "kud" — see docs/apps/kud.md for why) — a big, creative-leaning list of
// substitute words, not literal vulgar terms. All entries are playful, metaphorical
// references to female anatomy, not clinical/anatomical language. One flat pool (not
// split by category) since the generator just needs "a random funny word".
//
// Pruned and refreshed per feedback: the original "meeeer" expansion leaned on a handful
// of adjective+noun templates (X+tuin, X+grot, X+spelonk, X+paleis/tempel/kasteel) cranked
// out repeatedly — technically more entries, but weak/samey ("Maantempel"-style). Kept only
// the genuine standouts from that batch and replaced the rest with a wider variety of
// concrete, absurd everyday objects/places/professions (the pattern that was actually
// landing, e.g. Schaamteloket/Vochtvanger/Kietelautomaat) plus a few more directly crude
// entries, since "meer vulgair" was explicitly requested.
export const KUD_WORDS: readonly string[] = [
    // Classics from the brief
    'Vleesdoos',
    'Fitta',
    'Parmasandwich',

    // Standouts kept from the original list
    'Wondersteeg',
    'Kittelharenbos',
    'Poezenparadijs',
    'Beharingswinkel',
    'Vleesplooi',
    'Schaamteloket',
    'Liefdesbrievenbus',
    'Warme Bakkerij',
    'Onderbroekzone',
    'Fluitenkroeg',
    'Broodjeszaak',
    'Damespocket',
    'Kussentjeswinkel',
    'Damestas',
    'Vochtvanger',
    'Slijmhotel',
    'Kietelparadijs',
    'Poezenluik',
    'Vleesgordijn',
    'Damesschouwburg',
    'Kussenfabriek',
    'Kittelaarkasteel',
    'Vleesrijk',
    'Poezenpaleis',
    'Damesparfumerie',
    'Geurgordijn',
    'Kietelkastje',
    'Zachte Landing',
    'Zilte Oester',
    'Rijpe Perzik',
    'Schelpje',
    'Mosseltje',
    'Fluisterdoos',
    'Liefdesschatkist',
    'Damesgarage',
    'Vleeswarenafdeling',
    'Slagerswinkel',
    'Snoepwinkel',
    'Kietelautomaat',
    'Vochtigheidsfabriek',
    'Vochtcentrale',
    'Zoenfabriek',

    // Fresh batch — visceral/food (crude, not floral)
    'Visfabriek',
    'Viswinkel',
    'Mosselkraam',
    'Oesterbar',
    'Garnalenkraam',
    'Vleesschap',
    'Slagerskraam',
    'Poelier',
    'Tosti-ijzer',
    'Wafelijzer',
    'Kaneelbroodje',
    'Zure Bom',
    'Kokosmakroon',
    'Broodtrommel',
    'Koekblik',
    'Suikerpotje',
    'Vijgenkorf',
    'Druivenmand',
    'Notenschaal',
    'Fruitmand',
    'Snoeptrommel',
    'Chocoladedoos',
    'Cadeaudoosje',
    'Verrassingsdoosje',

    // Fresh batch — absurd everyday shops
    'Naaidoos',
    'Knopendoos',
    'Sieradendoosje',
    'Gereedschapskist',
    'Wasserette',
    'Stomerij',
    'Kapperszaak',
    'Bloemenwinkel',
    'Fietsenstalling',
    'Parkeergarage',
    'Kringloopwinkel',
    'Vlooienmarkt',
    'Tweedehandswinkel',
    'Sleutelwinkel',
    'Groentekraam',
    'Fruitkraam',
    'Kaaswinkel',
    'Notenbar',
    'Visafslag',
    'Boerenmarkt',
    'Kaasboerderij',
    'Zuivelfabriek',
    'Chocoladefabriek',
    'Geurenwinkel',

    // Fresh batch — bureaucratic absurdity
    'Lustloket',
    'Genotsbalie',
    'Klachtenloket',
    'Ministerie van Liefde',
    'Grenscontrole',
    'Paspoortbalie',
    'Visumloket',
    'Inlichtingendienst',

    // Fresh batch — devices/machines
    'Vochtmeter',
    'Kietelmachine',
    'Genotsautomaat',
    'Slijmmachine',
    'Kietelrobot',
    'Lustdetector',
    'Vochtsensor',
    'Trillingsapparaat',
    'Stoomgenerator',

    // Fresh batch — animal dens (crude, real-slang-adjacent)
    'Kattenbak',
    'Konijnenhol',
    'Bevernest',
    'Duivenhok',
    'Muizenholletje',

    // Fresh batch — doors/entrances
    'Draaideur',
    'Klapdeurtje',
    'Schuifdeurtje',
    'Achterom',
    'Kelderluik',
    'Zij-ingang',
    'Botenhuis',
    'Tuinhuisje',

    // Fresh batch — more direct/crude, per feedback to push further than florid euphemism
    'Natte Spleet',
    'Warme Spleet',
    'Roze Spleet',
    'Gleufje',
    'Kloofje',
];
