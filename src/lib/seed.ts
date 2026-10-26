import { randomBytes } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { hashPassword } from "./password";
import { nowSql } from "./db";
import { seedCollections, seedProducts, type SeedProduct } from "./seed-data";

function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20261026);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const between = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;

function dateFor(daysAgo: number, hour = between(8, 21), minute = between(0, 59)): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, minute, between(0, 59), 0);
  return nowSql(d);
}

function plusMinutes(dateStr: string, minutes: number): string {
  const d = new Date(dateStr.replace(" ", "T") + "Z");
  d.setMinutes(d.getMinutes() + minutes);
  return nowSql(d);
}

const guestNames = [
  "Brian Mwangi",
  "Achieng' Odera",
  "Mark Kimani",
  "Wambui Njoroge",
  "Farah Ali",
  "Nyokabi Wanjiru",
  "Daniel Otieno",
  "Zawadi Auma",
  "Kevin Mutua",
  "Lydia Chebet",
  "Hassan Omar",
  "Grace Wairimu",
  "Peter Kamau",
  "Salma Noor",
  "Ian Kariuki",
  "Mercy Atieno",
];

type DemoNeighbourhood = {
  area: string;
  streets: string[];
};

type DemoCity = {
  city: string;
  weight: number;
  neighbourhoods: DemoNeighbourhood[];
};

const demoCities: DemoCity[] = [
  {
    city: "Mombasa",
    weight: 7,
    neighbourhoods: [
      { area: "Nyali", streets: ["Links Road", "Nyali Road", "Mombasa-Malindi Road"] },
      { area: "Bamburi", streets: ["Bamburi Beach Road", "Mombasa-Malindi Road"] },
      { area: "Shanzu", streets: ["Shanzu Beach Road", "Mombasa-Malindi Road"] },
      { area: "Mtwapa", streets: ["Mtwapa Creek Road", "Mombasa-Malindi Road"] },
      { area: "Tudor", streets: ["Tudor Road", "Mbaraki Road"] },
      { area: "Kizingo", streets: ["Mama Ngina Drive", "Kizingo Road"] },
      { area: "Likoni", streets: ["Likoni Ferry Road", "Likoni-Ukunda Road"] },
      { area: "Mombasa Island", streets: ["Moi Avenue", "Nyerere Avenue", "Haile Selassie Avenue", "Digo Road"] },
    ],
  },
  {
    city: "Nairobi",
    weight: 3,
    neighbourhoods: [
      { area: "Westlands", streets: ["Woodvale Grove", "Mpaka Road", "Rhapta Road"] },
      { area: "Kilimani", streets: ["Ring Road", "Ole Sangale Road", "Chaka Road"] },
      { area: "Kileleshwa", streets: ["Laikipia Road", "Kandara Road"] },
      { area: "Lavington", streets: ["James Gichuru Road", "Gitanga Road"] },
      { area: "Parklands", streets: ["Third Parklands Avenue", "Aga Khan Road"] },
      { area: "Karen", streets: ["Karen Road", "Ngong Road"] },
      { area: "Riverside", streets: ["Riverside Drive", "Chiromo Road"] },
    ],
  },
];

const demoCityPool: DemoCity[] = [];
for (const city of demoCities) {
  for (let i = 0; i < city.weight; i += 1) demoCityPool.push(city);
}

function pickDemoAddress(): { address: string; city: string } {
  const city = pick(demoCityPool);
  const neighbourhood = pick(city.neighbourhoods);
  return {
    address: `${pick(neighbourhood.streets)}, ${neighbourhood.area}`,
    city: city.city,
  };
}

const traffic = [
  { source: "direct", medium: "none", campaign: null, weight: 34 },
  { source: "google", medium: "organic", campaign: null, weight: 16 },
  { source: "instagram", medium: "paid_social", campaign: "meta_prospecting", weight: 15 },
  { source: "instagram", medium: "paid_social", campaign: "meta_retargeting", weight: 8 },
  { source: "facebook", medium: "paid_social", campaign: "meta_prospecting", weight: 6 },
  { source: "tiktok", medium: "paid_social", campaign: "tiktok_creators", weight: 8 },
  { source: "google", medium: "cpc", campaign: "google_search", weight: 6 },
  { source: "whatsapp", medium: "social", campaign: "whatsapp_status", weight: 5 },
  { source: "instagram", medium: "referral", campaign: "influencer_delina", weight: 2 },
] as const;

const trafficPool: (typeof traffic)[number][] = [];
for (const item of traffic) {
  for (let i = 0; i < item.weight; i += 1) trafficPool.push(item);
}

const reviewNames = ["Achieng' O.", "Mark K.", "Wambui N.", "Farah A.", "Brian M.", "Nyokabi W.", "Hassan O.", "Grace W."];
const reviewBodies = [
  "Smells exactly like the bottle I tested at the counter. The 8 ml has lasted me almost three weeks of daily wear.",
  "Beautifully packaged and arrived faster than expected. The dry-down is the best part.",
  "I get compliments every single time I wear this. Worth sampling first — and now I want the full bottle.",
  "A little goes a long way. Two sprays in the morning and I can still smell it on my shirt at night.",
  "The real thing. I have tried dupes before and this is simply on another level.",
  "Bought this for my partner and have been borrowing it ever since. Warm, elegant, not too sweet.",
];

export function seedDatabase(db: DatabaseSync) {
  // Acquire the write lock before checking whether the seed is needed. Multiple
  // build workers can otherwise race and insert the same catalogue twice.
  db.exec("BEGIN IMMEDIATE");
  try {
    const existing = db.prepare("SELECT COUNT(*) AS c FROM products").get() as { c: number };
    if (existing.c > 0) {
      db.exec("COMMIT");
      return;
    }

    const insertCollection = db.prepare(
      "INSERT INTO collections (slug, title, subtitle, description, image, theme, sort) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    for (const c of seedCollections) {
      insertCollection.run(c.slug, c.title, c.subtitle, c.description, c.image, c.theme, c.sort);
    }

    const insertProduct = db.prepare(`
      INSERT INTO products (
        slug, sku, name, brand, gender, family, concentration, description, story,
        top_notes, heart_notes, base_notes, price_2, price_5, price_8, price_30,
        stock, status, badge, bestseller, new_arrival, featured, rating, review_count,
        image, gallery, collections, type, bundle_items, cost_price, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const stamp = nowSql();
    for (const p of seedProducts) {
      insertProduct.run(
        p.slug,
        p.sku,
        p.name,
        p.brand,
        p.gender,
        p.family,
        p.concentration,
        p.description,
        p.story,
        JSON.stringify(p.top_notes),
        JSON.stringify(p.heart_notes),
        JSON.stringify(p.base_notes),
        p.price_2,
        p.price_5,
        p.price_8,
        p.price_30,
        p.stock,
        p.status,
        p.badge,
        p.bestseller ? 1 : 0,
        p.new_arrival ? 1 : 0,
        p.featured ? 1 : 0,
        p.rating,
        p.review_count,
        p.image,
        JSON.stringify(p.gallery),
        JSON.stringify(p.collections),
        p.type,
        JSON.stringify(p.bundle_items),
        p.cost_price,
        stamp,
        stamp,
      );
    }

    const productRows = db
      .prepare("SELECT id, slug, name, brand, image, price_2, price_5, price_8, price_30, type, bestseller, featured, stock, status FROM products")
      .all() as unknown as (SeedProduct & { id: number })[];
    const productBySlug = new Map(productRows.map((p) => [p.slug, p]));
    const perfumeRows = productRows.filter((p) => p.type === "perfume");
    const orderableRows = productRows.filter((p) => p.type !== "atomizer" && p.status !== "discontinued");

    const adminPassword = hashPassword(
      process.env.ADMIN_PASSWORD ??
        (process.env.NODE_ENV === "production" ? randomBytes(32).toString("hex") : "Admin@1234"),
    );
    const memberPassword = hashPassword("Member@1234");
    const insertUser = db.prepare(
      "INSERT INTO users (name, email, password_hash, role, phone, membership_tier, store_credit, points, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );

    insertUser.run(
      "Wanjiru Kamau",
      "admin@maisonduscent.com",
      adminPassword,
      "admin",
      "+254 700 000 001",
      "Maison Team",
      0,
      0,
      dateFor(320),
    );
    insertUser.run(
      "Amara Njoroge",
      "amara@example.com",
      memberPassword,
      "member",
      "+254 712 345 678",
      "Circle",
      4500,
      1280,
      dateFor(210),
    );

    const customerUsers = [
      ["Brian Mwangi", "brian@example.com", "+254 711 222 333", 900, 240],
      ["Achieng' Odera", "achieng@example.com", "+254 722 333 444", 1500, 610],
      ["Mark Kimani", "mark@example.com", "+254 733 444 555", 0, 90],
      ["Wambui Njoroge", "wambui@example.com", "+254 744 555 666", 3000, 980],
      ["Farah Ali", "farah@example.com", "+254 755 666 777", 750, 180],
      ["Nyokabi Wanjiru", "nyokabi@example.com", "+254 766 777 888", 0, 60],
      ["Daniel Otieno", "daniel@example.com", "+254 777 888 999", 1200, 430],
      ["Zawadi Auma", "zawadi@example.com", "+254 788 999 000", 0, 120],
    ] as const;
    const customerIds: number[] = [];
    for (const [name, email, phone, credit, points] of customerUsers) {
      const res = insertUser.run(name, email, memberPassword, "member", phone, credit > 0 ? "Circle" : "Guest", credit, points, dateFor(between(20, 180)));
      customerIds.push(Number(res.lastInsertRowid));
    }
    const amaraId = 2;

    const insertAddress = db.prepare(
      "INSERT INTO addresses (user_id, label, line1, line2, city, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    insertAddress.run(amaraId, "Home", "Links Road, Nyali", "Apartment 4B", "Mombasa", "+254 712 345 678", 1);
    insertAddress.run(amaraId, "Office", "Woodvale Grove, Westlands", "3rd Floor", "Nairobi", "+254 712 345 678", 0);

    const insertReview = db.prepare(
      "INSERT INTO reviews (product_id, user_id, name, rating, title, body, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    const reviewTitles = ["A new signature", "Exactly what I hoped for", "Beautiful from the first spray", "Worth the sample", "Compliment magnet", "Lovely dry-down"];
    for (const p of perfumeRows) {
      for (let i = 0; i < 2; i += 1) {
        insertReview.run(
          p.id,
          null,
          reviewNames[(p.id + i) % reviewNames.length],
          i === 0 ? 5 : 4,
          reviewTitles[(p.id + i) % reviewTitles.length],
          reviewBodies[(p.id + i) % reviewBodies.length],
          dateFor(between(2, 100)),
        );
      }
    }

    const insertWishlist = db.prepare("INSERT OR IGNORE INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, ?)");
    for (const slug of ["delina-parfums-de-marly", "baccarat-rouge-540-extrait", "ombre-nomade-louis-vuitton", "bitter-peach-tom-ford"]) {
      const p = productBySlug.get(slug);
      if (p) insertWishlist.run(amaraId, p.id, dateFor(between(3, 40)));
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, customer_name, email, phone, address, city, notes,
        subtotal, delivery_fee, discount, total, payment_method, payment_status, status,
        source, medium, campaign, courier, tracking_number, rider, amount_collected,
        collected_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertOrderItem = db.prepare(
      "INSERT INTO order_items (order_id, product_id, name, brand, size, unit_price, qty, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const insertEvent = db.prepare(
      "INSERT INTO order_events (order_id, status, note, created_by, created_at) VALUES (?, ?, ?, ?, ?)",
    );

    const statusPlan: Record<string, string[]> = {
      pending: ["pending"],
      confirmed: ["pending", "confirmed"],
      packing: ["pending", "confirmed", "packing"],
      ready: ["pending", "confirmed", "packing", "ready"],
      out_for_delivery: ["pending", "confirmed", "packing", "ready", "out_for_delivery"],
      delivered: ["pending", "confirmed", "packing", "ready", "out_for_delivery", "delivered"],
      on_hold: ["pending", "confirmed", "on_hold"],
      cancelled: ["pending", "confirmed", "cancelled"],
      returned: ["pending", "confirmed", "packing", "out_for_delivery", "delivered", "returned"],
    };

    const sizeChoices = [
      { key: "2 ml", field: "price_2" as const, weight: 26 },
      { key: "5 ml", field: "price_5" as const, weight: 30 },
      { key: "8 ml", field: "price_8" as const, weight: 38 },
      { key: "30 ml", field: "price_30" as const, weight: 6 },
    ];
    const sizePool = sizeChoices.flatMap((s) => Array.from({ length: s.weight }, () => s));

    const memberEmails = new Map<number, { name: string; email: string; phone: string }>();
    for (const id of customerIds) {
      const u = db.prepare("SELECT name, email, phone FROM users WHERE id = ?").get(id) as { name: string; email: string; phone: string };
      memberEmails.set(id, u);
    }
    memberEmails.set(amaraId, { name: "Amara Njoroge", email: "amara@example.com", phone: "+254 712 345 678" });

    for (let i = 0; i < 48; i += 1) {
      const daysAgo = 44 - Math.floor((i * 44) / 47);
      let created = dateFor(daysAgo);
      let status: string;
      if (daysAgo <= 0) status = pick(["pending", "confirmed", "packing"]);
      else if (daysAgo <= 2) status = pick(["confirmed", "packing", "ready", "out_for_delivery"]);
      else if (daysAgo <= 5) status = pick(["out_for_delivery", "delivered", "delivered", "on_hold"]);
      else status = pick(["delivered", "delivered", "delivered", "delivered", "returned", "cancelled"]);

      let paymentStatus: string;
      if (status === "cancelled") paymentStatus = rng() < 0.7 ? "refunded" : "unpaid";
      else if (status === "returned") paymentStatus = rng() < 0.6 ? "refunded" : "paid";
      else if (status === "pending") paymentStatus = "unpaid";
      else if (status === "on_hold") paymentStatus = rng() < 0.5 ? "unpaid" : "cod";
      else if (status === "delivered") paymentStatus = "paid";
      else if (status === "out_for_delivery") paymentStatus = rng() < 0.5 ? "paid" : "cod";
      else paymentStatus = rng() < 0.45 ? "paid" : "unpaid";

      const t = pick(trafficPool);
      const isMemberOrder = i % 7 === 0 || i % 11 === 0;
      const memberId = i % 7 === 0 ? amaraId : pick(customerIds);
      const member = isMemberOrder ? memberEmails.get(memberId) : null;
      const guest = pick(guestNames);
      const customerName = member?.name ?? guest;
      const email = member?.email ?? `${guest.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
      const phone = member?.phone ?? `+254 7${between(10, 99)} ${between(100, 999)} ${between(100, 999)}`;

      const itemCount = pick([1, 1, 1, 2, 2, 3]);
      const chosen = new Set<string>();
      const items: { product: (typeof orderableRows)[number]; size: string; price: number; qty: number }[] = [];
      for (let j = 0; j < itemCount; j += 1) {
        let product = pick(orderableRows);
        let guard = 0;
        while (chosen.has(product.slug) && guard < 10) {
          product = pick(orderableRows);
          guard += 1;
        }
        chosen.add(product.slug);
        let size = "Set";
        let price = product.price_30;
        if (product.type === "bundle") {
          size = "5 × 8 ml set";
        } else {
          const s = pick(sizePool);
          size = s.key;
          price = product[s.field];
          if (!price) {
            size = "8 ml";
            price = product.price_8 || product.price_5 || product.price_2 || product.price_30;
          }
        }
        items.push({ product, size, price, qty: rng() < 0.12 ? 2 : 1 });
      }

      const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
      const deliveryFee = subtotal >= 5000 ? 0 : 350;
      const total = subtotal + deliveryFee;
      const { address, city } = pickDemoAddress();
      const courier = status === "delivered" || status === "out_for_delivery" ? pick(["Pickup Mtaani", "G4S Courier", "Bolt Courier", "Sendy"]) : null;
      const tracking = courier ? `${courier.slice(0, 2).toUpperCase()}-${between(100000, 999999)}` : null;
      const rider = courier ? pick(["Peter M.", "Ali H.", "Joyce W.", "Samuel K.", "Faith N."]) : null;
      const amountCollected = paymentStatus === "paid" ? total : 0;
      const collectedAt = amountCollected ? plusMinutes(created, between(30, 900)) : null;

      const result = insertOrder.run(
        `MDS-${10001 + i}`,
        isMemberOrder ? memberId : null,
        customerName,
        email,
        phone,
        address,
        city,
        i % 5 === 0 ? "Please wrap as a gift with a note." : "",
        subtotal,
        deliveryFee,
        0,
        total,
        pick(["mpesa", "mpesa", "mpesa", "card", "cod"]),
        paymentStatus,
        status,
        t.source,
        t.medium,
        t.campaign,
        courier,
        tracking,
        rider,
        amountCollected,
        collectedAt,
        created,
        created,
      );
      const orderId = Number(result.lastInsertRowid);

      for (const item of items) {
        insertOrderItem.run(orderId, item.product.id, item.product.name, item.product.brand, item.size, item.price, item.qty, item.product.image);
      }

      const plan = statusPlan[status];
      const notes: Record<string, string> = {
        pending: "Order received. Awaiting confirmation.",
        confirmed: "Order confirmed by the Maison team.",
        packing: "Decants measured and packing in progress.",
        ready: "Packed and ready for courier pickup.",
        out_for_delivery: `Out for delivery with ${courier}.`,
        delivered: "Delivered. Thank you for shopping with Maison du Scent.",
        on_hold: "Order placed on hold — awaiting customer response.",
        cancelled: "Order cancelled.",
        returned: "Return received and logged.",
      };
      let eventTime = created;
      for (const s of plan) {
        insertEvent.run(orderId, s, notes[s] ?? s, s === "packing" ? "Wanjiru Kamau" : "System", eventTime);
        eventTime = plusMinutes(eventTime, between(20, 200));
      }
      if (status === "delivered" && paymentStatus === "paid") {
        insertEvent.run(orderId, "payment_collected", `Payment of KSh ${total.toLocaleString("en-KE")} collected.`, "Wanjiru Kamau", collectedAt ?? eventTime);
      }
    }

    const insertView = db.prepare(
      "INSERT INTO page_views (path, page_type, product_id, session_id, referrer, source, medium, campaign, device, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    const insertEventTracked = db.prepare(
      "INSERT INTO events (name, path, session_id, metadata, created_at) VALUES (?, ?, ?, ?, ?)",
    );

    const categoryPages = [
      { path: "/", type: "home", weight: 22 },
      { path: "/perfumes/for-women", type: "category", weight: 14 },
      { path: "/perfumes/for-men", type: "category", weight: 13 },
      { path: "/perfumes", type: "category", weight: 9 },
      { path: "/best-sellers", type: "category", weight: 8 },
      { path: "/new-arrivals", type: "category", weight: 4 },
      { path: "/bundles", type: "category", weight: 6 },
      { path: "/brands", type: "category", weight: 4 },
      { path: "/perfume-gifts", type: "category", weight: 4 },
      { path: "/find-my-scent", type: "tool", weight: 4 },
      { path: "/collections/floral", type: "collection", weight: 3 },
      { path: "/collections/woody", type: "collection", weight: 3 },
      { path: "/journal", type: "journal", weight: 2 },
      { path: "/membership", type: "page", weight: 2 },
    ];
    const pagePool = categoryPages.flatMap((p) => Array(p.weight).fill(p));
    const topProductSlugs = ["baccarat-rouge-540-extrait", "delina-parfums-de-marly", "ombre-nomade-louis-vuitton", "aventus-creed", "guidance-amouage", "khamrah-lattafa", "bitter-peach-tom-ford", "layton-parfums-de-marly"];
    const productPool = [
      ...topProductSlugs.flatMap((slug) => Array(4).fill(slug)),
      ...perfumeRows.map((p) => p.slug),
    ];

    for (let daysAgo = 44; daysAgo >= 0; daysAgo -= 1) {
      const weekday = new Date(Date.now() - daysAgo * 86400000).getUTCDay();
      const weekendBoost = weekday === 0 || weekday === 6 ? 18 : 0;
      const visitors = Math.round(58 + (44 - daysAgo) * 1.5 + weekendBoost + rng() * 26);
      for (let v = 0; v < visitors; v += 1) {
        const sessionId = `seed-${daysAgo}-${v}-${between(1000, 9999)}`;
        const t = pick(trafficPool);
        const device = rng() < 0.74 ? "mobile" : rng() < 0.78 ? "desktop" : "tablet";
        const pageCount = rng() < 0.55 ? between(1, 2) : between(2, 4);
        let path = "/";
        let pageType = "home";
        let productId: number | null = null;
        for (let pv = 0; pv < pageCount; pv += 1) {
          if (pv === 0 || rng() < 0.5) {
            const cat = pick(pagePool);
            path = cat.path;
            pageType = cat.type;
            productId = null;
          } else if (rng() < 0.62) {
            const slug = pick(productPool);
            const prod = productBySlug.get(slug);
            if (prod) {
              path = `/perfumes/${slug}`;
              pageType = "product";
              productId = prod.id;
            } else {
              path = "/perfumes";
              pageType = "category";
            }
          } else {
            const cat = pick(pagePool);
            path = cat.path;
            pageType = cat.type;
            productId = null;
          }
          const stamp = dateFor(daysAgo, between(7, 23), between(0, 59));
          const referrer = t.source === "direct" ? null : `https://${t.source}.com/`;
          insertView.run(path, pageType, productId, sessionId, referrer, t.source, t.medium, t.campaign, device, stamp);

          if (pageType === "product" && rng() < 0.13) {
            insertEventTracked.run("add_to_cart", path, sessionId, JSON.stringify({ product: path.replace("/perfumes/", "") }), plusMinutes(stamp, 2));
          }
          if (pageType === "product" && rng() < 0.035) {
            insertEventTracked.run("whatsapp_click", path, sessionId, "{}", plusMinutes(stamp, 3));
          }
          if (pv === 0 && rng() < 0.055) {
            insertEventTracked.run("search", path, sessionId, JSON.stringify({ query: pick(["oud", "delina", "vanilla", "gift", "fresh", "baccarat", "rose"]) }), plusMinutes(stamp, 1));
          }
          if (pv === pageCount - 1 && pageType !== "product" && rng() < 0.03) {
            insertEventTracked.run("checkout_started", path, sessionId, "{}", plusMinutes(stamp, 4));
          }
        }
      }
    }

    const insertSubscriber = db.prepare("INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)");
    for (const email of [
      "grace@example.com",
      "hassan@example.com",
      "lydia@example.com",
      "kevin@example.com",
      "salma@example.com",
      "ian@example.com",
      "mercy@example.com",
      "peter@example.com",
    ]) {
      insertSubscriber.run(email, dateFor(between(1, 60)));
    }

    const settings: [string, string][] = [
      ["store_name", "Maison du Scent"],
      ["whatsapp_number", "maison_du_scent"],
      ["email", "hello@maisonduscent.com"],
      ["phone", "+254 700 000 001"],
      ["city", "Mombasa"],
      ["free_delivery_threshold", "5000"],
      ["delivery_fee", "350"],
      ["announcement", "Complimentary nationwide delivery on orders over KSh 5,000"],
      ["instagram", "@maisonduscent"],
      ["tiktok", "@maisonduscent"],
      ["opening_hours", "Monday – Friday · 9am – 6pm\nSaturday · 10am – 4pm\nSunday & public holidays · closed"],
      ["returns_days", "30"],
      ["membership_price", "1500"],
    ];
    const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [key, value] of settings) insertSetting.run(key, value);

    db.prepare("INSERT INTO meta (key, value) VALUES ('seeded_at', ?)").run(nowSql());
    db.prepare("INSERT INTO meta (key, value) VALUES ('seed_version', '1')").run();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
