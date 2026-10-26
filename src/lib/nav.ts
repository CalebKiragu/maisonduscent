export interface NavLink {
  label: string;
  href: string;
  note?: string;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}

export interface NavItem {
  label: string;
  href: string;
  groups?: NavGroup[];
  feature?: {
    image: string;
    eyebrow: string;
    title: string;
    href: string;
  };
}

export const primaryNav: NavItem[] = [
  { label: "New In", href: "/new-arrivals" },
  {
    label: "For Her",
    href: "/perfumes/for-women",
    groups: [
      {
        title: "Shop by mood",
        links: [
          { label: "All For Her", href: "/perfumes/for-women" },
          { label: "Date Night", href: "/collections/date-night" },
          { label: "Office Hours", href: "/collections/office" },
          { label: "Evening", href: "/collections/evening" },
          { label: "Clean & Skin", href: "/collections/clean" },
        ],
      },
      {
        title: "Shop by family",
        links: [
          { label: "Floral", href: "/collections/floral" },
          { label: "Amber & Warm", href: "/collections/winter" },
          { label: "Fresh", href: "/collections/summer-days" },
          { label: "Woody", href: "/collections/woody" },
        ],
      },
      {
        title: "Most loved",
        links: [
          { label: "Best Sellers", href: "/best-sellers" },
          { label: "The Discovery Edit", href: "/perfumes/the-discovery-edit-for-her" },
          { label: "Gifts for her", href: "/perfume-gifts" },
          { label: "The Niche Room", href: "/collections/niche" },
        ],
      },
    ],
    feature: {
      image: "/images/editorial/for-her.jpg",
      eyebrow: "The edit",
      title: "Soft power, in a bottle",
      href: "/collections/floral",
    },
  },
  {
    label: "For Him",
    href: "/perfumes/for-men",
    groups: [
      {
        title: "Shop by mood",
        links: [
          { label: "All For Him", href: "/perfumes/for-men" },
          { label: "Office Hours", href: "/collections/office" },
          { label: "Evening", href: "/collections/evening" },
          { label: "Date Night", href: "/collections/date-night" },
          { label: "Fresh & Clean", href: "/collections/clean" },
        ],
      },
      {
        title: "Shop by family",
        links: [
          { label: "Woody & Oud", href: "/collections/woody" },
          { label: "Amber & Spice", href: "/collections/winter" },
          { label: "Fresh Citrus", href: "/collections/summer-days" },
          { label: "The Niche Room", href: "/collections/niche" },
        ],
      },
      {
        title: "Most loved",
        links: [
          { label: "Best Sellers", href: "/best-sellers" },
          { label: "The Discovery Edit", href: "/perfumes/the-discovery-edit-for-him" },
          { label: "Gifts for him", href: "/perfume-gifts" },
          { label: "Travel atomizers", href: "/travel-atomizers" },
        ],
      },
    ],
    feature: {
      image: "/images/editorial/for-him.jpg",
      eyebrow: "The edit",
      title: "Quiet confidence, distilled",
      href: "/collections/woody",
    },
  },
  { label: "Best Sellers", href: "/best-sellers" },
  {
    label: "Bundles",
    href: "/bundles",
    groups: [
      {
        title: "Curated sets",
        links: [
          { label: "All bundles", href: "/bundles" },
          { label: "Discovery Edit: For Her", href: "/perfumes/the-discovery-edit-for-her" },
          { label: "Discovery Edit: For Him", href: "/perfumes/the-discovery-edit-for-him" },
          { label: "The Best Sellers", href: "/perfumes/the-best-sellers" },
          { label: "Evening Icons", href: "/perfumes/evening-icons" },
        ],
      },
      {
        title: "By mood",
        links: [
          { label: "Floral", href: "/perfumes/the-floral-collection" },
          { label: "Vanilla", href: "/perfumes/the-vanilla-collection" },
          { label: "Woody", href: "/perfumes/the-woody-collection" },
          { label: "Summer", href: "/perfumes/summer-escape" },
        ],
      },
      {
        title: "Gifting",
        links: [
          { label: "Perfume gifts", href: "/perfume-gifts" },
          { label: "Gift cards", href: "/gift-cards" },
          { label: "Corporate gifting", href: "/contact" },
        ],
      },
    ],
    feature: {
      image: "/images/editorial/gifts.jpg",
      eyebrow: "Build your own",
      title: "Five scents. One beautiful box.",
      href: "/bundles",
    },
  },
  {
    label: "Collections",
    href: "/collections",
    groups: [
      {
        title: "The world of scent",
        links: [
          { label: "All collections", href: "/collections" },
          { label: "Summer Days", href: "/collections/summer-days" },
          { label: "Clean", href: "/collections/clean" },
          { label: "Floral", href: "/collections/floral" },
          { label: "Woody", href: "/collections/woody" },
        ],
      },
      {
        title: "Occasions",
        links: [
          { label: "Evening", href: "/collections/evening" },
          { label: "Office Hours", href: "/collections/office" },
          { label: "Date Night", href: "/collections/date-night" },
          { label: "Winter Warmth", href: "/collections/winter" },
        ],
      },
      {
        title: "Discover",
        links: [
          { label: "The Niche Room", href: "/collections/niche" },
          { label: "Find my scent", href: "/find-my-scent" },
          { label: "Brands", href: "/brands" },
          { label: "The Journal", href: "/journal" },
        ],
      },
    ],
    feature: {
      image: "/images/editorial/niche.jpg",
      eyebrow: "Rare houses",
      title: "Enter the Niche Room",
      href: "/collections/niche",
    },
  },
  { label: "Brands", href: "/brands" },
  { label: "Gifts", href: "/perfume-gifts" },
  { label: "Journal", href: "/journal" },
];

export const footerNav = [
  {
    title: "Shop",
    links: [
      { label: "New arrivals", href: "/new-arrivals" },
      { label: "Best sellers", href: "/best-sellers" },
      { label: "For her", href: "/perfumes/for-women" },
      { label: "For him", href: "/perfumes/for-men" },
      { label: "Bundles & sets", href: "/bundles" },
      { label: "Travel atomizers", href: "/travel-atomizers" },
    ],
  },
  {
    title: "The Maison",
    links: [
      { label: "Our story", href: "/about" },
      { label: "The Journal", href: "/journal" },
      { label: "Membership", href: "/membership" },
      { label: "Find my scent", href: "/find-my-scent" },
      { label: "Gift cards", href: "/gift-cards" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Delivery", href: "/shipping-returns" },
      { label: "Returns", href: "/shipping-returns" },
      { label: "Track your order", href: "/account/orders" },
      { label: "Corporate gifting", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];
