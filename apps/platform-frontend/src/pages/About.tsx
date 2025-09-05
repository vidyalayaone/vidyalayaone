import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Target, Zap, Heart, Award } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Empowering educational institutions with technology that simplifies administration and enhances learning outcomes."
    },
    {
      icon: Heart,
      title: "Student-Centric",
      description: "Every feature we build puts students at the center, ensuring their educational journey is smooth and successful."
    },
    {
      icon: Shield,
      title: "Security First",
      description: "We prioritize the security and privacy of your school's data with enterprise-grade protection measures."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Continuously evolving our platform with the latest technology to stay ahead of educational needs."
    }
  ];
  
  const team = [
  {
    name: "Abhijeet Singh Thakur",
    role: "Lead Developer",
    background: "Architects the platform, leads system design, implements APIs, and oversees DevOps to ensure reliability and scalability.",
    image: "/Abhijeet.jpeg"
  },
  {
    name: "Suyash Pant",
    role: "Frontend Developer & Cloud Engineer",
    background: "Designs and develops intuitive user interfaces while managing cloud infrastructure for scalable, efficient, and cost-optimized deployments.",
    image: "/Suyash.jpeg"
  },
  {
    name: "Aditya Raj",
    role: "Backend Developer",
    background: "Builds and maintains backend services, APIs, and integrations to power the platform's core functionality.",
    image: "/Aditya-3.jpeg"
  },
  {
    name: "Vardaan Vig",
    role: "Product Manager",
    background: "Drives product vision, coordinates with schools, collects feedback, and plans features to align with user needs.",
    image: "/Vardaan.jpeg"
  }
];

  const achievements = [
    { number: "500+", label: "Schools Served" },
    { number: "2L+", label: "Students Managed" },
    { number: "15K+", label: "Teachers Connected" },
    { number: "99.9%", label: "Uptime" }
  ];

  const technologies = [
    "Cloud Infrastructure",
    "Data Encryption",
    "Mobile-First Design",
    "Real-time Sync",
    "API Integration",
    "Automated Backups",
    "Multi-tenant Architecture",
    "Progressive Web App"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            About VidyalayaOne
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            We're transforming school management across India by providing intuitive, comprehensive, and affordable technology solutions that empower educational institutions to focus on what matters most - education.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize school management technology across India, making comprehensive administrative tools accessible and affordable for schools of all sizes. We believe every educational institution deserves world-class technology to enhance their operations and student outcomes.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-secondary/10">
                    <Award className="h-8 w-8 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To become India's most trusted school management platform, empowering millions of educators and students through innovative technology that simplifies administration and enhances the educational experience nationwide.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our diverse team combines deep educational expertise with cutting-edge technology skills to build solutions that truly understand school needs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {member.image.startsWith('/') ? (
                      <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {member.image}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.background}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Technology & Security</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built on modern, scalable technology with enterprise-grade security to ensure your school's data is always safe and accessible.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {technologies.map((tech, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-2">
                  <Badge variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Want to Learn More?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            We'd love to hear from you and answer any questions about VidyalayaOne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="block">
              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardContent className="p-0">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Get in Touch</h3>
                  <p className="text-sm text-muted-foreground">
                    Contact our team for demos, questions, or partnership opportunities.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;