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
import gujFonts from "./gujarat_noto_sans.ttf";
import { User } from "@/types/user";
 

Font.register({
  family: "NotoSansGujarati",
  src: gujFonts,
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "NotoSansGujarati",
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
  currentUser : User | null
}; 

const StudentDetailsPDF = ({ student , currentUser }: Props) => {

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* School Header */}
        <View style={styles.header}>
                <Image src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfqnOKYunGlk9yZAe2k5DV3npmLXSCI4hJwg&s"} style={{ width: 130, height: 100 }} />
          <View style={{ marginLeft: 7}}>
            <Text style={styles.title}>{currentUser?.school.name}</Text>
            <Text style={{fontSize: 10, fontWeight: 8}}>{currentUser?.school.address}</Text>
          </View>
        </View>

        {/* Student Profile Header */}
        <View style={styles.profileSection}>
          <Image src={student.gender === 'Female' ? "../default_image_for_girl.png" : "../default_image_for_boy.png"} style={{ width: 130, height: 100 }}/>
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
            <Text style={styles.value}>
              {`${student.first_name_in_guj ?? ""} ${student.middle_name_in_guj ?? ""} ${student.last_name_in_guj ?? ""}`.trim()}
            </Text>
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
                <Text style={styles.value}>{student.father_name_in_guj}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Mother Name:</Text>
                <Text style={styles.value}>{student.mother_name}</Text>
                <Text style={styles.label}>Name in Gujarati:</Text>
                <Text style={styles.value}>{student.mother_name_in_guj}</Text>
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
                <Text style={styles.value}>{student.student_meta?.privious_school_in_guj}</Text>
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
                <Text style={styles.value}>{student.student_meta?.religiion_in_guj}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Caste:</Text>
                <Text style={styles.value}>{student.student_meta?.caste}</Text>
                <Text style={styles.label}>In Gujarati:</Text>
                <Text style={styles.value}>{student.student_meta?.caste_in_guj}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Category:</Text>
                <Text style={styles.value}>{student.student_meta?.category}</Text>
                <Text style={styles.label}></Text>
                <Text style={styles.value}></Text>
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
                <Text style={styles.label}></Text>
                <Text style={styles.value}></Text>
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
