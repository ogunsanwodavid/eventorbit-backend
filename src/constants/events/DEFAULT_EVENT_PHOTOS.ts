const DEFAULT_EVENT_PHOTOS = {
  "food and drinks": {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962105/food-n-drinks-social_y6mksf.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962105/food-n-drinks-cover_e7bbak.jpg",
  },
  social: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962911/social-social_zbfmor.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962911/social-cover_rrcecm.jpg",
  },
  music: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962908/music-social_lmsxg4.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962908/music-cover_mpc6mw.jpg",
  },
  crafts: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962879/crafts-social_uuonf4.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962879/crafts-cover_ngioaz.jpg",
  },
  sports: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962938/sports-social_ro1r3h.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962938/sports-cover_zlxfe9.jpg",
  },
  comedy: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962876/comedy-social_uaz4ey.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962877/comedy-cover_chhsdf.jpg",
  },
  film: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962891/film-social_r0lmjn.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962880/film-cover_o8blkz.jpg",
  },
  performances: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962911/performances-social_wvqveg.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962911/performances-cover_ehertk.jpg",
  },
  fashion: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962879/fashion-social_fytcsb.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962878/fashion-cover_via32q.jpg",
  },
  galleries: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962895/galleries-social_cfqvmf.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962893/galleries-cover_mntxh5.jpg",
  },
  tech: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962939/tech-social_zoe3zj.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962938/tech-cover_kzcps2.jpg",
  },
  business: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962875/business-social_vqgbnv.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962876/business-cover_ia7by3.jpg",
  },
  others: {
    social:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962910/others-social_gadyc8.jpg",
    cover:
      "https://res.cloudinary.com/ddcjuf3hq/image/upload/v1748962911/others-cover_xijdhd.jpg",
  },
} as const;

// Define a type for valid categories
export type EventCategory = keyof typeof DEFAULT_EVENT_PHOTOS;

export default DEFAULT_EVENT_PHOTOS;
