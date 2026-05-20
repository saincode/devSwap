const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },

    // ── Skills ──────────────────────────────────────────────────────────────
    skillsOffered: {
      type: [String],
      default: [],
    },
    skillsWanted: {
      type: [String],
      default: [],
    },

    // Proficiency per skill: { "React": "Intermediate", "Node.js": "Beginner" }
    skillProficiency: {
      type: Map,
      of: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      },
      default: {},
    },

    bio: {
      type: String,
      default: '',
    },
    isBeginnerMode: {
      type: Boolean,
      default: false,
    },

    // ── Learning Goal ────────────────────────────────────────────────────────
    learningGoal: {
      type: String,
      enum: [
        'Job Preparation',
        'Freelancing',
        'Startup Building',
        'Personal Interest',
        'College / Academic',
        '',
      ],
      default: '',
    },

    // ── Social & Portfolio Links ─────────────────────────────────────────────
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
      behance: { type: String, default: '' },
    },

    // ── Badges ───────────────────────────────────────────────────────────────
    badges: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
