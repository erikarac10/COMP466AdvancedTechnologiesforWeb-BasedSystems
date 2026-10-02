<?xml version="1.0" encoding="UTF-8"?> <!-- xml declaration -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<!-- 

COMP 466 Advanced Technologies for Web-Based Systems
TMA 1

Erika Racette

This is the xsl file used for part 1

-->
    <xsl:template match="/"> <!-- root template that matches root of XML -->
        <header id="headerResume"> <!-- display name from general section as an h1 -->
            <h1 id="h1Resume"><xsl:value-of select="resume/general/name"/></h1>
        </header>

        <main id="mainResume">
            <section id="objectiveResume">
                <h3 id="h3Resume">Objective:</h3>
                <p><xsl:value-of select="resume/general/objective"/></p> <!-- display the objective from 'general' -->
            </section>
            <section>
                <h2 id="h2Resume">Contact</h2> <!-- contact section -->
                <p><strong>Phone: </strong><xsl:value-of select="resume/general/phone"/></p> <!-- string, followed by XML info -->
                <p><strong>Email: </strong><xsl:value-of select="resume/general/email"/></p>
                <p><strong>Address: </strong><xsl:value-of select="resume/general/address"/></p>
            </section>

            <section> <!-- education section -->
                <h2 id="h2Resume">Education</h2>
                <xsl:for-each select="resume/education">
                    <p><strong>Degree: </strong><xsl:value-of select="degree"/></p>
                    <p><strong>University: </strong><xsl:value-of select="university"/></p>
                    <p><strong>Graduation Year: </strong><xsl:value-of select="graduationYear"/></p>
                </xsl:for-each>
            </section>

            <section>
                <h2 id="h2Resume">Experience</h2> <!-- experience section -->
                <xsl:for-each select="resume/experience/job"> <!-- loop through each job listed in experience -->
                    <p><strong>Title: </strong><xsl:value-of select="title"/></p>
                    <p><strong>Company: </strong><xsl:value-of select="company"/></p>
                    <p><strong>Start Date: </strong><xsl:value-of select="startDate"/></p>
                    <xsl:if test="endDate"> <!-- if there is an end date for the job, display it -->
                        <p><strong>End Date: </strong><xsl:value-of select="endDate"/></p>
                    </xsl:if>
                    <p><strong>Responsibilities:</strong></p>
                    <ul>
                        <xsl:for-each select="responsibilities/responsibility"> <!-- loop and display responsibilities -->
                            <li><xsl:value-of select="."/></li>
                        </xsl:for-each>
                    </ul>
                </xsl:for-each>
            </section>
        </main>
    </xsl:template>
</xsl:stylesheet>
