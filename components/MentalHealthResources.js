import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from "@mui/material";
import styles from "@/styles/collect.module.scss";

const MentalHealthResources = () => {
  return (
    <div>
        <h3>
            心理支持资源
        </h3>
      <p>
        根据您的回答，我们注意到您近期可能存在抑郁和焦虑情绪。我们为您准备了一份心理支持资源的清单。如果您有任何不适，请及时联系专业的心理服务人员。
        <br/>
        （所列资源均来源于网络公开信息，不代表上海纽约大学或研究员们的认可，请按需求谨慎甄别选择。）
      </p>
        
        <h3>
        LGBTQ+ 友好心理服务
            
        </h3>
      <TableContainer component={Paper} className={styles.table}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>地区</TableCell>
              <TableCell>资源名称</TableCell>
              <TableCell>联系方式</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                region: "全国",
                name: "小悟生心理",
                link: "https://mp.weixin.qq.com/s/HGThpiKlAtzWTKhonKUzdg",
              },
              {
                region: "全国",
                name: "全国跨性别热线",
                link: "https://mp.weixin.qq.com/s/tL13_b6kDCnlpDrrXBxSBg",
              },
              {
                region: "全国",
                name: "性别梦咨询室",
                link: "https://mp.weixin.qq.com/s/zbByUBa3eFOWB0jo8yQZWQ",
              },
              {
                region: "全国",
                name: "简单心理",
                link: "查看微信公众号",
              },
              {
                region: "全国",
                name: "阿黄的神秘柜子（同辈心理支持）",
                link: "https://mp.weixin.qq.com/s/xKvca8ngax60ZDYZUsPc0w",
              },
            ].map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.region}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  {row.link.startsWith("http") ? (
                    <Link href={row.link} target="_blank" rel="noopener">
                      查看微信公众号文章
                    </Link>
                  ) : (
                    row.link
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h3>
        心理危机干预及援助热线
      </h3>
      <TableContainer component={Paper} className={styles.table}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>地区</TableCell>
              <TableCell>资源名称</TableCell>
              <TableCell>联系方式</TableCell>
              <TableCell>备注</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                region: "全国",
                name: "生命教育与危机干预（希望）热线",
                contact: "400-161-9995",
                note: "24 小时",
              },
              {
                region: "全国",
                name: "家庭出柜咨询",
                contact: "400-082-0211",
                note: "",
              },
              {
                region: "北京",
                name: "北京危机干预中心心理援助热线",
                contact: "座机：800-810-1117 / 手机：010-82951332",
                note: "24 小时",
              },
              {
                region: "上海",
                name: "上海市精神卫生中心心理援助热线",
                contact: "021-962525",
                note: "24 小时",
              },
              {
                region: "其他",
                name: "其他地区心理热线",
                contact: (
                  <Link
                    href="https://mp.weixin.qq.com/s/0xB6qlfA_BC3ls9zU45FnA"
                    target="_blank"
                    rel="noopener"
                  >
                    查看微信公众号文章
                  </Link>
                ),
                note: "",
              },
            ].map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>{row.region}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.contact}</TableCell>
                <TableCell>{row.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MentalHealthResources;