import { Student } from "@/types/student";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";


// Register fonts (optional but recommended for better styling)
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxP.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc9.ttf",
      fontWeight: "bold",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333333",
  },
  profileSection: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "center",
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  studentId: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    padding: 5,
    color: "#333333",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "40%",
    fontSize: 10,
    color: "#666666",
  },
  value: {
    width: "60%",
    fontSize: 10,
    fontWeight: "bold",
  },
  columns: {
    flexDirection: "row",
    marginBottom: 10,
  },
  column: {
    width: "50%",
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
    paddingTop: 10,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
});

type Props = {
  student: Student;
}; 

const StudentDetailsPDF = ({ student }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* School Header */}
        <View style={styles.header}>
                <Image src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe7Ba2aq-TTW-H_ieh4nDoE_23MZ1qs0TOxg&s"} style={{ width: 130, height: 100 }} />
          <View style={{ marginLeft: 7}}>
            <Text style={styles.title}>Pragti Gujrat Goverment School</Text>
            <Text style={{fontSize: 10, fontWeight: 8}}>Address : 123 Education Lane, Knowledge City, KC 12345</Text>
          </View>
        </View>

        {/* Student Profile Header */}
        <View style={styles.profileSection}>
          <Image src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrmvSoqEMvs4E-TIgyfMdztZYEdKav-zok1A&s"} style={{ width: 130, height: 100 }}/>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.studentName}>{student.first_name} {student.middle_name} {student.last_name}</Text>
            <Text style={styles.studentId}>GR No: {student.gr_no} | Roll No: {student.roll_number}</Text>
          </View>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name in Gujarati:</Text>
            <Text style={styles.value}>{student.first_name_in_guj}</Text>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{student.gender}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{student.birth_date}</Text>
            <Text style={styles.label}>Birth Place:</Text>
            <Text style={styles.value}>{student.student_meta?.birth_place}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aadhar Number:</Text>
            <Text style={styles.value}>{student.aadhar_no}</Text>
            <Text style={styles.label}>Aadhar DISE Number:</Text>
            <Text style={styles.value}>{student.student_meta?.aadhar_dise_no}</Text>
          </View>
        </View>

        {/* Family Details */}
        <View style={styles.columns}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Family Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Father Name:</Text>
                <Text style={styles.value}>{student.father_name}</Text>
                <Text style={styles.label}>Name in Gujarati:</Text>
                <Text style={styles.value}>{student.father_name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Mother Name:</Text>
                <Text style={styles.value}>{student.mother_name}</Text>
                <Text style={styles.label}>Name in Gujarati:</Text>
                <Text style={styles.value}>{student.mother_name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Primary Mobile:</Text>
                <Text style={styles.value}>{student.primary_mobile}</Text>
                <Text style={styles.label}>Secondary Mobile:</Text>
                <Text style={styles.value}>{student.student_meta?.secondary_mobile}</Text>
              </View>
            </View>
          </View>

          {/* Academic Details */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Admission Date:</Text>
                <Text style={styles.value}>{student.student_meta?.admission_date}</Text>
                <Text style={styles.label}>Admission Class:</Text>
                <Text style={styles.value}>{student.student_meta?.admission_class_id}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Admission Division:</Text>
                <Text style={styles.value}>{null}</Text>
                <Text style={styles.label}>Current Class:</Text>
                <Text style={styles.value}>{null}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Previous School:</Text>
                <Text style={styles.value}>{student.student_meta?.privious_school}</Text>
                <Text style={styles.label}>In Gujarati:</Text>
                <Text style={styles.value}>{student.student_meta?.privious_school}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Other Details */}
        <View style={styles.columns}>
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Other Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Religion:</Text>
                <Text style={styles.value}>{student.student_meta?.religiion}</Text>
                <Text style={styles.label}>In Gujarati:</Text>
                <Text style={styles.value}>{student.student_meta?.religiion}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Caste:</Text>
                <Text style={styles.value}>{student.student_meta?.caste}</Text>
                <Text style={styles.label}>In Gujarati:</Text>
                <Text style={styles.value}>{student.student_meta?.caste}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{student.student_meta?.category}</Text>
              </View>
            </View>
          </View>

          {/* Address Details */}
          <View style={styles.column}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address Details</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{student.student_meta?.address}</Text>
                <Text style={styles.label}>District:</Text>
                <Text style={styles.value}>{student.student_meta?.district}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>City:</Text>
                <Text style={styles.value}>{student.student_meta?.city}</Text>
                <Text style={styles.label}>State:</Text>
                <Text style={styles.value}>{student.student_meta?.state}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Postal Code:</Text>
                <Text style={styles.value}>{student.student_meta?.postal_code}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Bank Name:</Text>
            <Text style={styles.value}>{student.student_meta?.bank_name}</Text>
            <Text style={styles.label}>Account Number:</Text>
            <Text style={styles.value}>{student.student_meta?.account_no}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IFSC Code:</Text>
            <Text style={styles.value}>{student.student_meta?.IFSC_code}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This document was generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default StudentDetailsPDF;
