// `art` drives an original, editor-drawn plate for each song. These are not album
// covers: official artwork is copyrighted and is not reproduced anywhere on this site.
export const SONG_CREDITS = [
  {
    id: "tomboy",
    title: "TOMBOY",
    year: 2022,
    art: { motif: "slash", base: "#7a1024", accent: "#ff7f95", edge: "#2a0a13" },
    roles: {
      lyrics: ["Soyeon"],
      composed: ["Soyeon", "Pop Time", "JENCI"],
      arranged: ["Pop Time", "JENCI", "Soyeon"],
    },
    sourceIds: ["S12"],
  },
  {
    id: "nxde",
    title: "Nxde",
    year: 2022,
    art: { motif: "frame", base: "#6b4a12", accent: "#ffd36a", edge: "#2c1c04" },
    roles: {
      lyrics: ["Soyeon"],
      composed: ["Soyeon", "Pop Time", "Kako"],
      arranged: ["Pop Time", "Kako", "Soyeon"],
    },
    sourceIds: ["S13"],
  },
  {
    id: "queencard",
    title: "Queencard",
    year: 2023,
    art: { motif: "card", base: "#4a2270", accent: "#f7a8d8", edge: "#1d0c30" },
    roles: {
      lyrics: ["Soyeon"],
      composed: ["Soyeon", "Pop Time", "Daily", "Likey"],
      arranged: ["Pop Time", "Daily", "Likey", "Soyeon"],
    },
    sourceIds: ["S14"],
  },
];

export const CREDIT_ROLE_LABELS = {
  lyrics: "作詞 Lyrics",
  composed: "作曲 Composed",
  arranged: "編曲 Arranged",
};
